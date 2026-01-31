/**
 * リクエストビルダーユーティリティ
 *
 * フォーム要件をGoogle Forms APIリクエストに変換する
 *
 * 使用方法:
 *   const { buildBatchUpdateRequests } = require('./scripts/utils/build-request');
 *   const requests = buildBatchUpdateRequests(formConfig);
 */

/**
 * 質問タイプからAPI形式へのマッピング
 */
const TYPE_MAPPING = {
  SHORT_TEXT: (q) => ({
    textQuestion: { paragraph: false }
  }),

  LONG_TEXT: (q) => ({
    textQuestion: { paragraph: true }
  }),

  RADIO: (q) => ({
    choiceQuestion: {
      type: 'RADIO',
      options: buildOptions(q.options, q.hasOther),
      shuffle: q.shuffle || false
    }
  }),

  CHECKBOX: (q) => ({
    choiceQuestion: {
      type: 'CHECKBOX',
      options: buildOptions(q.options, q.hasOther),
      shuffle: q.shuffle || false
    }
  }),

  DROP_DOWN: (q) => ({
    choiceQuestion: {
      type: 'DROP_DOWN',
      options: buildOptions(q.options, false) // DROP_DOWNはisOther使用不可
    }
  }),

  SCALE: (q) => ({
    scaleQuestion: {
      low: q.low || 1,
      high: q.high || 5,
      lowLabel: q.lowLabel || '',
      highLabel: q.highLabel || ''
    }
  }),

  DATE: (q) => ({
    dateQuestion: {
      includeYear: q.includeYear !== false,
      includeTime: q.includeTime || false
    }
  }),

  TIME: (q) => ({
    timeQuestion: {
      duration: q.duration || false
    }
  }),

  RATING: (q) => ({
    ratingQuestion: {
      ratingScaleLevel: q.ratingScaleLevel || 5,
      iconType: q.iconType || 'STAR'
    }
  }),

  GRID_RADIO: (q) => ({
    questionGroupItem: {
      questions: (q.rows || []).map(row => ({
        rowQuestion: { title: row },
        required: q.required || false
      })),
      grid: {
        columns: {
          type: 'RADIO',
          options: buildOptions(q.columns || q.options, false)
        },
        shuffleQuestions: q.shuffleQuestions || false
      }
    }
  }),

  GRID_CHECKBOX: (q) => ({
    questionGroupItem: {
      questions: (q.rows || []).map(row => ({
        rowQuestion: { title: row },
        required: q.required || false
      })),
      grid: {
        columns: {
          type: 'CHECKBOX',
          options: buildOptions(q.columns || q.options, false)
        },
        shuffleQuestions: q.shuffleQuestions || false
      }
    }
  })
};

/**
 * 選択肢配列をAPI形式に変換
 * @param {Array<string|Object>} options 選択肢
 * @param {boolean} hasOther 「その他」オプションを追加
 * @returns {Array<Object>}
 */
function buildOptions(options, hasOther = false) {
  if (!options || options.length === 0) {
    throw new Error('選択肢が必要です');
  }

  const result = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt };
    }
    // 条件分岐付きオプション
    const option = { value: opt.value };
    if (opt.goToAction) {
      option.goToAction = opt.goToAction;
    }
    if (opt.goToSectionId) {
      option.goToSectionId = opt.goToSectionId;
    }
    return option;
  });

  if (hasOther) {
    result.push({ isOther: true });
  }

  return result;
}

/**
 * 採点設定をAPI形式に変換
 * @param {Object} grading 採点設定
 * @returns {Object}
 */
function buildGrading(grading) {
  if (!grading) return undefined;

  const result = {
    pointValue: grading.pointValue || 0
  };

  if (grading.correctAnswer || grading.correctAnswers) {
    const answers = grading.correctAnswers || [grading.correctAnswer];
    result.correctAnswers = {
      answers: answers.map(a => ({ value: a }))
    };
  }

  if (grading.whenRight) {
    result.whenRight = buildFeedback(grading.whenRight);
  }

  if (grading.whenWrong) {
    result.whenWrong = buildFeedback(grading.whenWrong);
  }

  if (grading.generalFeedback) {
    result.generalFeedback = buildFeedback(grading.generalFeedback);
  }

  return result;
}

/**
 * フィードバックをAPI形式に変換
 * @param {string|Object} feedback フィードバック
 * @returns {Object}
 */
function buildFeedback(feedback) {
  if (typeof feedback === 'string') {
    return { text: feedback };
  }

  const result = { text: feedback.text || '' };

  if (feedback.material) {
    result.material = feedback.material.map(m => {
      if (m.link) {
        return {
          link: {
            uri: m.link.uri || m.link.url,
            displayText: m.link.displayText || m.link.text
          }
        };
      }
      if (m.video) {
        return {
          video: {
            youtubeUri: m.video.youtubeUri || m.video.url,
            displayText: m.video.displayText || m.video.text
          }
        };
      }
      return m;
    });
  }

  return result;
}

/**
 * 質問をcreateItemリクエストに変換
 * @param {Object} question 質問設定
 * @param {number} index 質問インデックス
 * @returns {Object} createItemリクエスト
 */
function buildQuestionRequest(question, index) {
  const type = question.type?.toUpperCase();
  const typeBuilder = TYPE_MAPPING[type];

  if (!typeBuilder) {
    throw new Error(`未対応の質問タイプ: ${type}`);
  }

  const questionContent = typeBuilder(question);

  // グリッド系は特別なアイテム構造
  if (type === 'GRID_RADIO' || type === 'GRID_CHECKBOX') {
    return {
      createItem: {
        item: {
          title: question.title,
          description: question.description || undefined,
          ...questionContent
        },
        location: { index }
      }
    };
  }

  // 通常の質問
  const item = {
    title: question.title,
    description: question.description || undefined,
    questionItem: {
      question: {
        required: question.required || false,
        ...questionContent
      }
    }
  };

  // 採点設定（クイズモード時）
  if (question.grading) {
    item.questionItem.question.grading = buildGrading(question.grading);
  }

  return {
    createItem: {
      item,
      location: { index }
    }
  };
}

/**
 * セクション（ページ区切り）リクエストを生成
 * @param {Object} section セクション設定
 * @param {number} index インデックス
 * @returns {Object} createItemリクエスト
 */
function buildSectionRequest(section, index) {
  return {
    createItem: {
      item: {
        title: section.title || '',
        description: section.description || undefined,
        pageBreakItem: {}
      },
      location: { index }
    }
  };
}

/**
 * フォーム設定更新リクエストを生成
 * @param {Object} settings 設定
 * @returns {Object} updateSettingsリクエスト
 */
function buildSettingsRequest(settings) {
  const updateMasks = [];
  const settingsObj = {};

  if (settings.isQuiz !== undefined) {
    settingsObj.quizSettings = { isQuiz: settings.isQuiz };
    updateMasks.push('quizSettings.isQuiz');
  }

  if (settings.emailCollectionType) {
    settingsObj.emailCollectionType = settings.emailCollectionType;
    updateMasks.push('emailCollectionType');
  }

  if (updateMasks.length === 0) {
    return null;
  }

  return {
    updateSettings: {
      settings: settingsObj,
      updateMask: updateMasks.join(',')
    }
  };
}

/**
 * フォーム情報更新リクエストを生成
 * @param {Object} info フォーム情報
 * @returns {Object} updateFormInfoリクエスト
 */
function buildFormInfoRequest(info) {
  const updateMasks = [];
  const infoObj = {};

  if (info.description) {
    infoObj.description = info.description;
    updateMasks.push('description');
  }

  if (updateMasks.length === 0) {
    return null;
  }

  return {
    updateFormInfo: {
      info: infoObj,
      updateMask: updateMasks.join(',')
    }
  };
}

/**
 * フォーム設定からbatchUpdateリクエスト配列を生成
 * @param {Object} config フォーム設定
 * @returns {Array<Object>} batchUpdateリクエスト配列
 */
function buildBatchUpdateRequests(config) {
  const requests = [];
  let itemIndex = 0;

  // 1. フォーム情報更新
  if (config.description || config.basicInfo?.description) {
    const infoRequest = buildFormInfoRequest({
      description: config.description || config.basicInfo?.description
    });
    if (infoRequest) requests.push(infoRequest);
  }

  // 2. 設定更新
  if (config.settings) {
    const settingsRequest = buildSettingsRequest(config.settings);
    if (settingsRequest) requests.push(settingsRequest);
  }

  // 3. 質問追加
  if (config.questions) {
    for (const question of config.questions) {
      requests.push(buildQuestionRequest(question, itemIndex++));
    }
  }

  // 4. セクション付きの場合
  if (config.sections) {
    itemIndex = 0;
    for (const section of config.sections) {
      // セクションヘッダー（最初のセクション以外）
      if (section.title && itemIndex > 0) {
        requests.push(buildSectionRequest(section, itemIndex++));
      }

      // セクション内の質問
      if (section.questions) {
        for (const question of section.questions) {
          requests.push(buildQuestionRequest(question, itemIndex++));
        }
      }
    }
  }

  return requests;
}

/**
 * 公開設定リクエストを生成
 * @param {boolean} isPublished 公開状態
 * @param {boolean} isAcceptingResponses 回答受付状態
 * @returns {Object}
 */
function buildPublishRequest(isPublished = true, isAcceptingResponses = true) {
  return {
    publishSettings: {
      publishState: {
        isPublished,
        isAcceptingResponses
      }
    }
  };
}

module.exports = {
  buildBatchUpdateRequests,
  buildQuestionRequest,
  buildSectionRequest,
  buildSettingsRequest,
  buildFormInfoRequest,
  buildPublishRequest,
  buildOptions,
  buildGrading,
  buildFeedback,
  TYPE_MAPPING
};
