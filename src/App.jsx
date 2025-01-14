import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入 CSS
import { useEffect, useState } from 'react';

const { VITE_BASE_URL: API_URL, VITE_APP_PATH: API_PATH } = import.meta.env;

const LoginPanel = ({ isAuth, setIsAuth }) => {
  const [account, setAccount] = useState({});
  const accountHandler = (e) => {
    const { value, name } = e.target;
    setAccount({
      ...account,
      [name]: value,
    });
  };
  const signIn = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/v2/admin/signin`, account);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
      axios.defaults.headers.common['Authorization'] = token;

      setIsAuth(true);
      alert('登入成功');
    } catch (error) {
      alert('帳號或密碼錯誤');
      setIsAuth(false);
      console.log(error);
    }
  };

  return (
    <>
      <div
        className={`flex-column justify-content-center align-items-center vh-100 ${
          isAuth ? 'd-none' : 'd-flex'
        }`}
      >
        <h1 className="mb-5">請先登入</h1>
        <form className="d-flex flex-column gap-3" onSubmit={signIn}>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              name="username"
              id="username"
              placeholder="name@example.com"
              onChange={accountHandler}
            />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input
              type="password"
              name="password"
              className="form-control"
              id="password"
              placeholder="Password"
              onChange={accountHandler}
            />
            <label htmlFor="password">Password</label>
          </div>
          <button className="btn btn-primary">登入</button>
        </form>
        <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
      </div>
    </>
  );
};

const ProductsPanel = ({ isAuth, setIsAuth }) => {
  const [tempProduct, setTempProduct] = useState({});
  const [products, setProducts] = useState([]);
  const getProducts = async () => {
    try {
      const cookie = document.cookie.replace(
        /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
        '$1'
      );
      axios.defaults.headers.common['Authorization'] = cookie;
      const res = await axios.get(
        `${API_URL}/v2/api/${API_PATH}/admin/products`
      );
      const { products:productsResult } = res.data;
      setProducts([...productsResult]);
    } catch (error) {
      setIsAuth(false);
      console.log(error);
    }
  };
  const checkUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/v2/api/user/check`);
      console.log(res);
      alert('使用者已登入成功');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className={`container py-5 ${!isAuth ? 'd-none' : 'd-block'}`}>
      <button
        type="button"
        className="btn btn-success mb-4"
        onClick={checkUser}
      >
        檢查使用者是否登入
      </button>
      <div className="row">
        <div className="col-6">
          <h2>產品列表</h2>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">查看細節</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.title}</th>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td>{product.is_enabled}</td>
                  <td>
                    <button
                      onClick={() => setTempProduct(product)}
                      className="btn btn-primary"
                      type="button"
                    >
                      查看細節
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-6">
          <h2>單一產品細節</h2>
          {tempProduct.title ? (
            <div className="card">
              <img
                src={tempProduct.imageUrl}
                className="card-img-top img-fluid"
                alt={tempProduct.title}
              />
              <div className="card-body">
                <h5 className="card-title">
                  {tempProduct.title}
                  <span className="badge text-bg-primary">
                    {tempProduct.category}
                  </span>
                </h5>
                <p className="card-text">商品描述：{tempProduct.description}</p>
                <p className="card-text">商品內容：{tempProduct.content}</p>
                <p className="card-text">
                  <del>{tempProduct.origin_price} 元</del> / {tempProduct.price}{' '}
                  元
                </p>
                <h5 className="card-title">更多圖片：</h5>
                {tempProduct.imagesUrl?.map(
                  (image) =>
                    image && (
                      <img key={image} src={image} className="img-fluid" />
                    )
                )}
              </div>
            </div>
          ) : (
            <p>請選擇一個商品查看</p>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    const cookie = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      '$1'
    );
    cookie ? setIsAuth(true) : setIsAuth(false);
  }, []);

  return (
    <>
      <LoginPanel isAuth={isAuth} setIsAuth={setIsAuth} />
      <ProductsPanel isAuth={isAuth} setIsAuth={setIsAuth} />
    </>
  );
}

export default App;
