const express = require("express");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const flash = require("connect-flash");

const app = express();
const port = process.env.PORT || 5005;
const userController = require("./controllers/user");
const lotteryController = require("./controllers/lottery");
const questionController = require("./controllers/question");

app.set("view engine", "ejs");

app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.JAB_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 }, // 單位是毫秒
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.errorMsg = req.flash("errorMsg");
  next();
});

function redirectBack(req, res) {
  res.redirect("back");
}

function checkIsAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    if (req.url === "/admin") {
      req.flash("errorMsg", "權限不足啊 靚仔！");
      return res.redirect("/");
    } else {
      // 取得資料前，要權限認證
      // 不能只有 res.status() 後面必須加上 .send()，這樣 fetch 的 .then 才會有 resp 能接收
      return res.status(404).send("<h1>You bad bad</h1>");
    }
  }
  next();
}

// 首頁路由
app.get("/", userController.index);

// 註冊路由
app.get("/register", userController.register);
app.post("/register", userController.handleRegister, redirectBack);

// 登入路由
app.get("/login", userController.login);
app.post("/login", userController.handleLogin, redirectBack);

// 登出路由
app.get("/logout", userController.logout);

// 常見問題路由
app.get("/FAQ", questionController.questionPage);

// 抽獎路由
app.get("/lottery", lotteryController.lotteryPage);
// 提供隨機獎品路由
app.get("/lottery-prize-api", lotteryController.prizeOffer);

// 後台管理路由
app.get("/admin", checkIsAdmin, userController.admin);

// 抽獎管理路由
app.get("/admin-lottery-get", checkIsAdmin, lotteryController.getAdmin);
app.post("/admin-lottery-add", checkIsAdmin, lotteryController.handleAddAdmin);
app.post(
  "/admin-lottery-update/:id",
  checkIsAdmin,
  lotteryController.handleUpdateAdmin
);
app.get(
  "/admin-lottery-delete/:id",
  checkIsAdmin,
  lotteryController.handleDeleteAdmin
);

app.listen(port, () => {
  console.log(`JustABite_restaurant app listen at http://localhost:${port}`);
});
