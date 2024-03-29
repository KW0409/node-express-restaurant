const express = require("express");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const flash = require("connect-flash");

const app = express();
const port = process.env.JAB_PORT || 5005;
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
      req.flash("errorMsg", "警告！您的權限不足！！！");
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

// 購物清單路由
// TODO: get 路由要補上 /:id
// TODO: 之後可考慮改成 restful 寫法，如：/admin/member/:id, /admin/member/:id
app.get("/cart", userController.cartList);
// app.post("/admin-member-update/:id", checkIsAdmin, userController.handleUpdate);

// 點餐路由
// TODO: get 路由要補上 /:id
// TODO: 之後可考慮改成 restful 寫法，如：/admin/member/:id, /admin/member/:id
app.get("/menu", userController.menu);
// app.post("/admin-member-update/:id", checkIsAdmin, userController.handleUpdate);

// 使用者會員專區路由
app.get("/user", userController.user);

// 我的訂單路由
// TODO: get 路由要補上 /:id
// TODO: 之後可考慮改成 restful 寫法，如：/admin/member/:id, /admin/member/:id
app.get("/user/order-detail/:id", userController.orderDetail);
// app.post("/admin-member-update/:id", checkIsAdmin, userController.handleUpdate);

// 店家後台管理路由
// TODO: 進入後台管理前，要權限認證
app.get("/admin", checkIsAdmin, userController.admin);

// 會員管理路由
// TODO: get 路由要補上 /:id
// TODO: 之後可考慮改成 restful 寫法，如：/admin/member/:id, /admin/member/:id
app.get("/admin/member-detail/:id", checkIsAdmin, userController.memberDetail);
// app.post("/admin-member-update/:id", checkIsAdmin, userController.handleUpdate);

// 訂單列表路由
// TODO: get 路由要補上 /:id
// TODO: 之後可考慮改成 restful 寫法，如：/admin/member/:id, /admin/member/:id
app.get("/admin/order-detail/:id", checkIsAdmin, userController.orderDetail);
// app.post("/admin-member-update/:id", checkIsAdmin, userController.handleUpdate);

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
