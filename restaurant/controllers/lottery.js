const db = require("../models");

const PrizeList = db.KWang_restaurant_prize_list;

function randomPrize(systemErrWeight, prizeDatas) {
  const systemRandomNum = Math.floor(Math.random() * 100 + 1);
  if (systemRandomNum <= systemErrWeight) {
    // 讓系統有一定機率回傳會觸發前端 '系統不穩定' 機制的OPEN獎
    const openPrize = {
      rank: "OPEN獎",
      description:
        "汪勒個汪！我是 OPEN 獎，偷偷告訴你，其實系統才沒有不穩定勒～",
    };
    return openPrize;
  }

  const prizeWeightList = [];
  let prizeWeightSum = 0;
  for (const prizeData of prizeDatas) {
    prizeWeightSum += prizeData.percentage;
    prizeWeightList.push({
      prizeWeight: prizeWeightSum,
      data: {
        rank: prizeData.rank,
        description: prizeData.description,
        image: prizeData.image,
      },
    });
  }

  const prizeRandomNum = Math.floor(Math.random() * prizeWeightSum + 1);
  for (const prize of prizeWeightList) {
    if (prize.prizeWeight >= prizeRandomNum) {
      return prize.data;
    }
  }
}

const lotteryController = {
  // 抽獎頁面(非管理頁面)
  lotteryPage: (req, res) => {
    res.render("pages/lottery");
  },

  // 提供隨機獎品的 lotteryAPI(按機率)
  prizeOffer: async (req, res) => {
    try {
      const prizeDatas = await PrizeList.findAll({
        order: [["id", "ASC"]],
      });

      if (!prizeDatas.length) {
        // 因為是 findAll，所以要用 .length 來判斷，如果找不到資料會回傳空陣列 []
        console.log("prizeOffer_Error:", "查無資料！");
        return res.status(502).send("Fail to offer prize");
      }
      const systemErrWeight = 20;
      const prize = randomPrize(
        systemErrWeight,
        JSON.parse(JSON.stringify(prizeDatas))
      );
      res.json(prize);
    } catch (err) {
      console.log("prizeOffer_Error:", err.toString());
      return res.status(502).send("Fail to offer prize");
    }
  },

  // 以下皆為管理頁面的操作
  getAdmin: async (req, res) => {
    try {
      const prizeDatas = await PrizeList.findAll({
        order: [["id", "ASC"]],
      });

      if (!prizeDatas.length) {
        console.log("getAdmin_Error:", "查無資料！");
        return res.status(502).send("Fail to get lottery data");
      }
      res.json(prizeDatas);
    } catch (err) {
      console.log("getAdmin_Error:", err.toString());
      return res.status(502).send("Fail to get lottery data");
    }
  },

  handleAddAdmin: async (req, res) => {
    const data = req.body;
    if (!data) {
      console.log("handleAddAdmin_Error:", "data 未傳入");
      return res.status(502).send("Fail to add lottery data");
    }

    try {
      const lastData = await PrizeList.create({
        sequence: data.sequence,
        rank: data.rank,
        prize: data.prize,
        description: data.description,
        image: data.image,
        amount: data.amount,
        percentage: data.percentage,
      });

      res.json(lastData.id);
    } catch (err) {
      console.log("handleAddAdmin_Error:", err.toString());
      return res.status(502).send("Fail to add lottery data");
    }
  },

  handleUpdateAdmin: async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    if (!data) {
      console.log("handleUpdateAdmin_Error:", "data 未傳入");
      return res.status(502).send("Fail to update lottery data");
    }

    try {
      const prizeData = await PrizeList.findOne({
        where: {
          id,
        },
      });

      if (!prizeData) {
        console.log("handleUpdateAdmin-find1_Error:", "查無資料！");
        return res.status(502).send("Fail to update lottery data");
      }

      try {
        await prizeData.update({
          sequence: data.sequence,
          rank: data.rank,
          prize: data.prize,
          description: data.description,
          image: data.image,
          amount: data.amount,
          percentage: data.percentage,
        });

        res.status(200).send("lottery update success");
      } catch (err) {
        console.log("handleUpdateAdmin-update_Error:", err.toString());
        return res.status(502).send("Fail to update lottery data");
      }
    } catch (err) {
      console.log("handleUpdateAdmin-find2_Error:", err.toString());
      return res.status(502).send("Fail to update lottery data");
    }
  },

  handleDeleteAdmin: async (req, res) => {
    const { id } = req.params;

    try {
      const prizeData = await PrizeList.findOne({
        where: {
          id,
        },
      });

      if (!prizeData) {
        console.log("handleDeleteAdmin-find1_Error:", "查無資料！");
        return res.status(502).send("Fail to delete lottery data");
      }

      try {
        await prizeData.destroy();
        res.status(200).send("lottery delete success");
      } catch (err) {
        console.log("handleDeleteAdmin-destroy_Error:", err.toString());
        return res.status(502).send("Fail to delete lottery data");
      }
    } catch (err) {
      console.log("handleDeleteAdmin-find2_Error:", err.toString());
      return res.status(502).send("Fail to delete lottery data");
    }
  },
};

module.exports = lotteryController;
