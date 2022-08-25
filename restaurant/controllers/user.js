const bcrypt = require("bcrypt");
const db = require("../models");

const Users = db.KWang_restaurant_users;
const saltRounds = 10;

const userController = {
  index: (req, res) => {
    res.render("index");
  },

  register: (req, res) => {
    res.render("users/register");
  },

  handleRegister: (req, res, next) => {
    const { nickname, username, password } = req.body;
    if (!nickname || !username || !password) {
      req.flash("errorMsg", "註冊資料有缺，請重新填寫");
      return next();
    }

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        req.flash("errorMsg", "使用者資料處理失敗，請再重試一次！");
        console.log("handleRegister_bcrypt_Error:", err.toString());
        return next();
      }

      try {
        const userData = await Users.create({
          nickname,
          username,
          password: hash,
        });

        req.session.username = userData.username;
        res.redirect("/");
      } catch (err) {
        if (err.parent.errno === 1062) {
          req.flash("errorMsg", "此帳號已註冊！");
          return next();
        }
        req.flash("errorMsg", "錯誤：帳號註冊失敗！");
        console.log("handleRegister_Error:", err.toString());
        return next();
      }
    });
  },

  login: (req, res) => {
    res.render("users/login");
  },

  handleLogin: async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      req.flash("errorMsg", "登入資料有缺，請重新填寫！");
      return next();
    }

    try {
      const userData = await Users.findOne({
        where: {
          username,
        },
      });

      if (!userData) {
        // 因為是 findOne，所以不需要用 .length 來判斷，如果找不到資料就會是回傳 null
        req.flash("errorMsg", "帳號/密碼輸入錯誤！");
        return next();
      }

      bcrypt.compare(password, userData.password, (err, isPass) => {
        if (err) {
          req.flash("errorMsg", "使用者資料解析失敗，請再重試一次！");
          console.log("handleLogin_bcrypt_Error:", err.toString());
          return next();
        }

        if (!isPass) {
          req.flash("errorMsg", "帳號/密碼輸入有誤！");
          return next();
        }

        req.session.username = username;
        if (userData.user_auth === 1) {
          req.session.isAdmin = true;
        }
        res.redirect("/");
      });
    } catch (err) {
      req.flash("errorMsg", "錯誤：帳號登入失敗！");
      console.log("handleLogin_Error:", err.toString());
      return next();
    }
  },

  logout: (req, res) => {
    req.session.username = null;
    req.session.isAdmin = null;
    res.redirect("/");
  },

  user: (req, res) => {
    res.render("users/user/user");
  },

  admin: (req, res) => {
    res.render("users/admin/admin");
  },

  // TODO:
  memberDetail: (req, res) => {
    res.render("users/admin/memberDetail");
  },

  // TODO:
  orderDetail: (req, res) => {
    /*
    // id 本來就是 URL 的一部分，所以不用特地檢查
    const { id } = req.params
    // 如果是 /user/order-detail 就要檢查 req.session.username 是否跟 order 相同
    // 如果是 /admin/order-detail 則不用，因為路由已經有檢查是否為 req.session.isAdmin
    const route = req.url.split('?')[0]

    try {
      const orderData = await Orders.findOne({
        where: {
          id
        },
        include: Users
      })

      if (route === "user" && req.session.user !== orderData.user.username) {
        console.log('articlePage-1_Error:', '查無資料！')
        return res.send("<script>alert('Err(articlePage-1)：獲取文章失敗，請在稍後重試！')</script>")
      }

      res.render("users/orderDetail", { orderData });
    } catch (err) {
      console.log('articlePage-2_Error:', err.toString())
      return res.send("<script>alert('Err(articlePage-2)：獲取資料失敗，請在稍後重試！')</script>")
    }
    */

    const orderData = {
      id: 1,
      num: 123321,
      item: [
        {
          image: "/css/lottery_pic/bg.png",
          dishname: "鮮嫩洋芋白丁佐莎莎",
          price: 260,
          amount: 2,
        },
      ],
      bill: {
        name: "user",
        address: "台灣台北",
        phone: "09123456789",
        email: "user@mail.com",
      },
      state: "處理中",
      createdAt: "2022-08-05 14:23:51",
      user: {
        username: "user00",
        name: "user",
        address: "台灣台北",
        phone: "09123456789",
        email: "user@mail.com",
        user_auth: 0,
      },
    };
    res.render("users/orderDetail", { orderData });
  },

  // TODO:
  cartList: (req, res) => {
    res.render("pages/cartList");
  },

  // TODO:
  menu: (req, res) => {
    res.render("pages/menu");
  },
};

module.exports = userController;
