import React, { useState } from 'react';
import { useParams } from "react-router-dom"
import { Button, Upload, Form, Input, Flex, Rate, Divider,Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import "../css/layout.css";
import axios from 'axios';
import { web3, evalueteContract } from "../contract/contractUtils_yjw";

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
const { Option } = Select;

const GoodsCommont = () => {
    const [ipfsHash, setIpfsHash] = useState(null);
    const prarms = useParams()
    const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5OWQzN2I4YS0yMDYyLTRjYTctOTgzMS1kZGMxYmJiNjIxMzIiLCJlbWFpbCI6IjE4MzM3MzkyODNAcXEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjlhYTE4MmI0NTU3MDcxZGFmNjE2Iiwic2NvcGVkS2V5U2VjcmV0IjoiNjQxMTI1NTk1ZjE4YWYxMjA3Y2IxOWFkNmExNTdmMjM2NGE1ZTY4NjM4Mzc0ZjBlOTdhNGJhYWJmOGU4ZTk2ZSIsImlhdCI6MTcxNzU1MjI0OH0.MNYPSDD7OczWwWQmHjCpNvd49XeB-x6k_u4Q5smW2Ns"; // 请确保这是有效的JWT  
    const [fileList, setFileList] = useState([]);
    const [value, setValue] = useState();
    console.log("上传成功:", ipfsHash);
    const onFinish = async (values) => {
        console.log('Received values of form: ', values);
        window.localStorage.setItem("roleIds", values.roleIds);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        var account = accounts[0];
        var buyerAddress = window.localStorage.getItem("buyerAddress");
        console.log(buyerAddress);
        var sellerAddress = window.localStorage.getItem("sellerAddress");
        console.log(sellerAddress);
        const selectedDesc = desc[value - 1];
        await evalueteContract.methods.addCommont(values.roleIds,buyerAddress, sellerAddress, prarms.id, selectedDesc, values.description, ipfsHash)
            .send({ from: account })
            .on('receipt', function (receipt) {
                if (receipt.status == 1) {
                    alert("评价成功");
                } else {
                    alert("评价失败");
                }
            })
    }
    const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];

    // 图片上传
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

            <Form
                onFinish={onFinish}
               
                initialValues={{
                    remember: true,
                }}
                scrollToFirstError
            >
                <Divider type="vertical" style={{ height: '100%' }} />
                <Divider orientation="left">评价界面</Divider>
                <Form.Item
                    name="roleIds"
                    label="角色"
                    style={{
                        maxWidth: 200,
                    }}
                >
                    <Select placeholder="请选择角色">
                        <Option value="1">买家</Option>
                        <Option value="2">卖家</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label="上传图片 "

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

                <Form.Item
                    name="score"
                    label="评分"
                >
                    <Flex gap="middle" vertical>
                        <Rate tooltips={desc} onChange={setValue} value={value} />
                        {value ? <span>{desc[value - 1]}</span> : null}
                    </Flex>
                </Form.Item>

                <Form.Item
                    name="description"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    style={{
                        maxWidth: 600,
                    }}
                >
                    <Input style={{ width: '100%', height: '100px' }} placeholder="说说对商品的想法..." />
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        确定
                    </Button>
                </Form.Item>

            </Form>
        </div>
    );
};

export default GoodsCommont;
