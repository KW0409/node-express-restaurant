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
    const data = {
      // (await dataUtils.getAPI());
      username: "user00",
      name: "user",
      address: "台灣台北",
      phone: "09123456789",
      email: "user@mail.com",
      user_auth: 0,
    };
    res.render("users/admin/memberDetail", { data });
  },

  // TODO:
  orderDetail: (req, res) => {
    const data = {
      // (await dataUtils.getAPI());
      username: "user00",
      name: "user",
      address: "台灣台北",
      phone: "09123456789",
      email: "user@mail.com",
      user_auth: 0,
    };
    res.render("users/orderDetail", { data });
  },
};

module.exports = userController;
