import React, { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select, Radio, Modal } from 'antd';
import "../css/layout.css";
import { web3, buyerListContract, sellerListContract } from "../contract/contractUtils_yjw";

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const Register = () => {
  const [form] = Form.useForm();
  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    // 处理注册逻辑
    const accounts = await web3.eth.getAccounts();
    var account = accounts[0];
    if (values.roleId === '1') {
      await buyerListContract.methods.createBuyer(values.username, values.password, values.gender, values.phone)
        .send({ from: account, gas: '5000000' })
        .on('transactionHash', async function (hash) {
          console.log("交易哈希:", hash);
          const value = await web3.eth.getTransaction(hash)

          console.log(value)
        })
        .on('receipt', function (receipt) {
          // receipt example
          if (receipt.status == 1) {
            window.location.href = "/";
            console.log("注册成功");
          } else {
            console.log("注册不成功");
          }
        })
        .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error('交易出错:', error);

        }).catch((error) => {
          // 交易出错，error 包含错误信息  
          console.error('交易出错:', error);

          // 如果错误是由合约的require或assert导致的，error.message通常会包含'revert'字样  
          if (error.message.includes('revert')) {
            // 处理合约内require或assert失败的逻辑  
            // 可能需要解析error.data以获取更详细的回滚原因  

            modal.error({
              title: '注册失败',
              content: `原因：注册失败，可能重复注册或者gas不够`,
            });
          }
        })

    } else if (values.roleId === '2') {
      await sellerListContract.methods.createSeller(values.username, values.password, values.gender, values.phone)
        .send({ from: account, gas: '5000000' })
        .on('receipt', function (receipt) {
          // receipt example
          if (receipt.status == 1) {
            window.location.href = "/";
            console.log("注册成功");
          } else {
            console.log("注册不成功");
          }
        })
        .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error('交易出错:', error);

        }).catch((error) => {
          // 交易出错，error 包含错误信息  
          console.error('交易出错:', error);

          // 如果错误是由合约的require或assert导致的，error.message通常会包含'revert'字样  
          if (error.message.includes('revert')) {
            // 处理合约内require或assert失败的逻辑  
            // 可能需要解析error.data以获取更详细的回滚原因  

            modal.error({
              title: '注册失败',
              content: `原因：注册失败，可能重复注册或者gas不够`,
            });
          }
        })

    }
  };

  const [value, setValue] = useState(1);
  const onChange = (e) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };
  const [modal, contextHolder] = Modal.useModal();

  return (
    <div className="register-container"> {contextHolder}


      <Form
        {...formItemLayout}
        form={form}
        name="register"
        className="register-form"
        onFinish={onFinish}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        scrollToFirstError
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        >
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="输入用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[
            {
              required: true,
              message: '请输入密码!',
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="输入密码"
          />
        </Form.Item>
        <Form.Item
          name="cpassword"
          label="确认密码"
          rules={[
            {
              required: true,
              message: '请确认密码!',
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="确认密码"
          />
        </Form.Item>
        <Form.Item
          name="phone"
          label="电话号码"
          rules={[
            {
              required: true,
              message: '请输入电话号码!',
            },
          ]}
        >
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="输入电话号码" />
        </Form.Item>


        <Form.Item
          name="gender"
          label="性别"
          rules={[
            {
              required: true,
              message: '请选择性别!',
            },
          ]}
        >
          <Radio.Group onChange={onChange} value={value}>
            <Radio value={true}>男</Radio>
            <Radio value={false}>女</Radio>

          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="roleId"
          label="角色"
          rules={[
            {
              required: true,
              message: '请选择角色!',
            },
          ]}
        >
          <Select
            showSearch
            style={{
              width: 200,
            }}
            placeholder="请选择角色"
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').includes(input)}
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={[
              {
                value: '1',
                label: '用户',
              },
              {
                value: '2',
                label: '卖家',
              }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('请勾选《用户协议》')),
            },
          ]}
          {...tailFormItemLayout}
        >
          <Checkbox>
            我已阅读并同意 <a href="">《用户协议》</a>
          </Checkbox>
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>

          <Button type="primary" htmlType="submit" className="login-form-button">
            注册
          </Button>
          Or <a href="/" onClick={() => window.localStorage.setItem("isToRegister", false)}>已有账号去登录!</a>
        </Form.Item>

      </Form>
     </div>
  );
};

export default Register;
