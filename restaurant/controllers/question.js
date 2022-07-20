// const questionModel = require('../models/question')

const questionController = {
  // 常見問題頁面(非管理頁面)
  questionPage: (req, res) => {
    res.render('pages/question')
  }
}

module.exports = questionController
