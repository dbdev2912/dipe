var express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var router = express.Router();
// Kết nối với cơ sở dữ liệu MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'nhan',
  password: 'root',
  database: 'dipe'
});
function checkdata(input) {
  let valid = true;
  if (input.length === 0) {
    valid = false;
  }
  else {
    const specialChars = [ " ", "*", "+" ]
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if ( specialChars.indexOf(char) !== -1 ) {
        valid = false;
      }
    }
  }
  return valid;
}
// Đăng ký tài khoản người dùng mới
router.post('/create_user', async (req, res) => {
    /* Thêm account_role vào body vì đã chia ra thêm một role mới là su ( stands for super user ) */
  const { user } = req.body;
  const { account_string, pwd_string, account_role, fullname, email, phone, address } = user;
  if (!checkdata(account_string)) {
    return res.status(400).json({ success: false, content: 'Vui lòng nhập tài khoản' });
  }
  if (!checkdata(pwd_string)) {
    return res.status(400).json({ success: false, content: 'Vui lòng nhật mật khẩu' });
  }
  else {
    // Kiểm tra xem tài khoản đã tồn tại hay chưa
    const [existingUser] = await connection.promise().query(
      'SELECT * FROM accounts WHERE account_string = ?',
      [account_string]
    );
    if (existingUser.length > 0) {
      return res.status(404).json({ success: false, content: 'Tài khoản đã tồn tại' });
    }
    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(pwd_string, 10);
    const account_status = 1;
    const credential_string = 'hihi' + (new Date()).getTime();

    // Thêm người dùng mới vào cơ sở dữ liệu
    await connection.promise().query(
      'INSERT INTO accounts (account_string, pwd_string, account_status, credential_string, account_role ) VALUES (?, ?, ?, ?, ?)',
      [account_string, hashedPassword, account_status, credential_string, account_role]
    );

    await connection.promise().query(
      'INSERT INTO account_detail (credential_string, fullname, phone, email, address ) VALUES (?, ?, ?, ?, ?)',
      [credential_string, fullname, phone, email, address]
    );

    res.status(200).json({ success: true, credential_string, content: 'Tài khoản đã được tạo thành công' });
  }
});
// Đăng nhập tài khoản người dùng
router.post('/login', async (req, res) => {
  const { account_string, pwd_string } = req.body;
  // Kiểm tra xem tài khoản tồn tại hay không
  const [existingUser] = await connection.promise().query(
    'SELECT * FROM accounts WHERE account_string = ?',
    [account_string]
  );
  if (existingUser.length === 0) {
    return res.status(404).json({ success: false, content: 'Sai thông tin đăng nhập' });
  }
  const hashedPassword = existingUser[0].pwd_string;
  if (bcrypt.compareSync(pwd_string, hashedPassword)) {
    //   // Tạo mã JWT để xác thực người dùng
    const token = jwt.sign({ credential_string: existingUser[0].credential_string }, 'your-jwt-secret', { expiresIn: '1h' });
    res.status(200).json({ success: true, content: 'Đăng nhập thành công', role: existingUser[0].account_role, credential_string: existingUser[0].credential_string, _token: token });
  } else {
    res.status(404).json({ success: false, content: 'Sai tài khoản hoặc mật khẩu' });
  }
});

// Đổi mật khẩu người dùng
router.put('/changepassword', async (req, res) => {
  const { credential_string, oldpwd_string, newpwd_string } = req.body;
  // Kiểm tra xem tài khoản tồn tại hay không
  const [existingUser] = await connection.promise().query(
    'SELECT * FROM accounts WHERE credential_string = ?',
    [credential_string]
  );
  if (existingUser.length === 0) {
    return res.status(404).json({ success: false, content: 'Tài khoản không tồn tại' });
  }
  // So sánh mật khẩu đã mã hóa với mật khẩu người dùng nhập vào
  const isPasswordValid = await bcrypt.compare(oldpwd_string, existingUser[0].pwd_string);
  if (!isPasswordValid) {
    return res.status(404).json({ success: false, content: 'Mật khẩu cũ không chính xác' });
  }
  // Mã hóa mật khẩu mới trước khi lưu vào cơ sở dữ liệu
  const hashedNewPassword = await bcrypt.hash(newpwd_string, 10);
  // Cập nhật mật khẩu mới cho tài khoản người dùng
  await connection.promise().query(
    'UPDATE accounts SET pwd_string = ? WHERE credential_string = ?',
    [hashedNewPassword, credential_string]
  );
  res.status(200).json({ success: true, content: 'Mật khẩu đã được thay đổi thành công' });
});

module.exports = router;
