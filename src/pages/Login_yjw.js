import React from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Result, Select } from 'antd';
import "../css/layout.css";
import { web3, buyerListContract, sellerListContract } from "../contract/contractUtils_yjw";

const { Option } = Select;
const Login = () => {
  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    // 处理登录逻辑
    const accounts = await web3.eth.getAccounts();
    var account = accounts[0];
    try {
      if (values.roleId === "1") {
        var result = await buyerListContract.methods.verifyPwd(values.username, values.password).call({ from: account })
        var isLogin = result[0];
        var buyerId = Number(result[1])

      } else {
        var result = await sellerListContract.methods.verifyPwd(values.username, values.password).call({ from: account })
        var isLogin = result[0];
        var sellerId = Number(result[1])
      }
    } catch (e) {
      alert(e)
    }
    if (isLogin) {
       //获取用户地址
       window.localStorage.setItem("account", account);
       window.localStorage.setItem("username", values.username);
      //定义登录用户的Id和buyer合约地址
      window.localStorage.setItem("buyerId", buyerId); 
      var buyerContractAddress = await buyerListContract.methods.getBuyerList().call({ from: account });
      var buyerAddress = buyerContractAddress[buyerId -1];
      window.localStorage.setItem("buyerAddress", buyerAddress);
      // // console.log(buyerAddress);
      //定义登录卖家的Id
      window.localStorage.setItem("sellerId", sellerId);
      var sellerContractAddress = await sellerListContract.methods.getSellerList().call({ from: account });
      var sellerAddress = sellerContractAddress[sellerId-1];
      window.localStorage.setItem("sellerAddress", sellerAddress);
      //跳转页面
      window.localStorage.setItem("roleId", values.roleId);
      window.location.href = "/api/" + values.roleId;
    } else {
      window.location.href = "/";
    }

  };


  return (
    <div className='login-container'>
     <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: '请输入你的用户名!',
          },
        ]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: '请输入你的密码!',
          },
        ]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item
        name="roleId"
        rules={[
          {
            required: true,
            message: '请选择角色!',
          },
        ]}
      >
        <Select placeholder="请选择角色">
          <Option value="1">用户</Option>
          <Option value="2">卖家</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>记住我</Checkbox>
        </Form.Item>

        <a className="login-form-forgot" href="">
          忘记密码
        </a>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          登录
        </Button>
        Or <a href="/register">现在注册!</a>
      </Form.Item>
    </Form>
    </div>
  );
};

export default Login;