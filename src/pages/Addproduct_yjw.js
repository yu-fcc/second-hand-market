import React, { useState } from 'react';
import { Upload, Button, Form, Input,Switch ,Divider} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import axios from 'axios';
import { web3, sellerListContract, sellerABI } from "../contract/contractUtils_yjw";

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



const Addproduct = () => {
  const [form] = Form.useForm();
  const [ipfsHash, setIpfsHash] = useState(null);
  const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5OWQzN2I4YS0yMDYyLTRjYTctOTgzMS1kZGMxYmJiNjIxMzIiLCJlbWFpbCI6IjE4MzM3MzkyODNAcXEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjlhYTE4MmI0NTU3MDcxZGFmNjE2Iiwic2NvcGVkS2V5U2VjcmV0IjoiNjQxMTI1NTk1ZjE4YWYxMjA3Y2IxOWFkNmExNTdmMjM2NGE1ZTY4NjM4Mzc0ZjBlOTdhNGJhYWJmOGU4ZTk2ZSIsImlhdCI6MTcxNzU1MjI0OH0.MNYPSDD7OczWwWQmHjCpNvd49XeB-x6k_u4Q5smW2Ns"; // 请确保这是有效的JWT  
  const [fileList, setFileList] = useState([]);
  console.log("上传成功:", ipfsHash);
  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    var account = accounts[0];
    var sellerId = window.localStorage.getItem("sellerId");
    var sellerContractAddress = await sellerListContract.methods.getSellerList().call({ from: account });
    const sellerContract = new web3.eth.Contract(sellerABI, sellerContractAddress[sellerId - 1]);
    await sellerContract.methods.addProduct(values.productName, values.description, values.price, values.quantity,ipfsHash, values.classes)
      .send({ from: account, gas: '5000000' })
      .on('receipt', function (receipt) {
        // receipt example
        if (receipt.status == 1) {
          alert("添加成功");
        } else {
          alert("添加不成功");
        }
      })
  }

  const beforeUpload = (file) => {
    // 这里只是检查文件类型，实际上传逻辑在 handleUpload 中  
    const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJPGorPNG) {
      alert('You can only upload JPG or PNG file!');
      return false;
    }
    return true;
  };

  const handleUpload = async (options) => {
    const { onSuccess, onError, file } = options;
    const formData = new FormData();
    formData.append("file", file);

    // 假设您已经有了一个方法来生成或获取 pinataMetadata 和 pinataOptions  
    // 这里只是示例数据，您需要根据实际情况填写  
    const pinataMetadata = JSON.stringify({
      name: file.name, // 使用文件原始名称或自定义名称  
      // ... 其他 metadata  
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      // ... 其他 options  
    });
    formData.append("pinataOptions", pinataOptions);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      // 假设 Pinata 返回了一个包含 IPFS hash 的对象  
      // 您需要根据 Pinata 的实际 API 响应来解析数据  
      const ipfsHash = response.data.IpfsHash; // 示例字段，请根据实际情况修改  
      setIpfsHash(ipfsHash);
      // 通知上传成功，并可以选择性地更新 fileList  
      onSuccess(ipfsHash);

    } catch (error) {
      onError(error);
    }
  };

  const customRequest = async (options) => {
    handleUpload(options);
  };
  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  }
  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  return (
    <div>

       <Divider orientation="left" style={{ fontSize: '30px' }}>商品上架</Divider>
      <h2 style={{ textAlign: 'center' }}></h2>
      <Form
        {...formItemLayout}
        form={form}
        name="addProduct"
        onFinish={onFinish}
        style={{
          maxWidth: 600,
        }}
        scrollToFirstError
      >
        <Form.Item
          name="productName"
          label="商品名称"
          rules={[
            {
              required: true,
              message: '请输入你的商品名称!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="商品描述"
          rules={[
            {
              required: true,
              message: '请输入你的商品描述!',
            },
          ]}

        >
          <Input />
        </Form.Item>


        <Form.Item
          name="price"
          label="价格 "
          rules={[
            {
              required: true,
              message: '请输入正确的价格!',
            },

          ]}
        >
          <Input />
        </Form.Item>


        <Form.Item
          name="quantity"
          label="库存 "
          rules={[
            {
              required: true,
              message: '请输入商品库存 !',
            },
          ]}
        >
          <Input />
        </Form.Item>
    
        <Form.Item label="是否在售" name="onSale">
          <Switch checkedChildren="是" unCheckedChildren="否" defaultChecked />
        </Form.Item>

        <Form.Item
          name="classes"
          label="商品类别"
          rules={[
            {
              required: true,
              message: '请输入商品类别!',
            },

          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="productImage"
          label="商品图片 "

        >
          <ImgCrop rotationSlider>
            <Upload
              customRequest={customRequest}
              beforeUpload={beforeUpload}
              listType="picture-card"
              fileList={fileList}
              onPreview={onPreview}
              onChange={onChange}
            >
              {fileList.length < 5 && <div>
                <Button icon={<PlusOutlined />}>
                  + Upload
                </Button>
              </div>}
            </Upload>
          </ImgCrop>
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            提交商品
          </Button>
        </Form.Item>
      </Form>
    </div>

  );
}
export default Addproduct; 
