import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Form, Input, notification } from 'antd';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import Navbar from '../layouts/Navbar/Navbar';

const ResetPassword = ({ match }) => {
  const [values, setValues] = useState({
    name: '',
    resetPasswordLink: '',
    invalidToken: false,
    buttonText: 'Submit',
    passwordReset: {
      success: false,
      message: '',
    },
  });

  const { name, resetPasswordLink, buttonText, invalidToken, passwordReset } = values;

  useEffect(() => {
    const token = match.params.token;

    // Checking if invalid token
    if (!jwt.decode(token)) return setValues({ ...values, invalidToken: true });

    // Decode Token (Pulling name out)
    const { name } = jwt.decode(token);

    // Setting State Values
    if (token) setValues({ ...values, name, resetPasswordLink: token });
  }, []);

  const [form] = Form.useForm();

  const onFinish = (inputValues) => {
    setValues({ ...values, buttonText: 'Submitting...' });

    axios({
      method: 'PUT',
      url: `/api/reset-password`,
      data: { resetPasswordLink, newPassword: inputValues.confirm },
    })
      .then((response) => {
        setValues({
          ...values,
          buttonText: 'Submitted',
          newPassword: '',
          passwordReset: { success: true, message: response.data.message },
        });
      })
      .catch((error) => {
        setValues({
          ...values,
          buttonText: 'Submit',
          passwordReset: { success: false, message: '' },
        });
        notification.error({ message: error.response.data.error });
      });
  };

  // resetPasswordForm Form
  const resetPasswordForm = () => (
    <Form layout='vertical' form={form} onFinish={onFinish}>
      <Form.Item
        name='password'
        label='Password'
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
        hasFeedback
      >
        <Input.Password placeholder='Your Password' />
      </Form.Item>

      <Form.Item
        name='confirm'
        label='Confirm Password'
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Please confirm your password!',
          },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject('The two passwords that you entered do not match!');
            },
          }),
        ]}
      >
        <Input.Password placeholder='Confirm Your Password' />
      </Form.Item>

      <Form.Item>
        <button
          disabled={buttonText === 'Submitting...' ? true : false}
          className='main-btn'
          style={{
            borderRadius: '0',
            padding: '0.3rem 2rem',
          }}
        >
          {buttonText}
        </button>
      </Form.Item>
    </Form>
  );

  // Form Styles
  const resetStyles = {
    margin: '5rem auto',
    width: '50%',
    height: '50%',
    padding: '2rem',
    backgroundColor: '#ffff',
  };

  return (
    <div style={{ marginTop: '9rem' }}>
      <Navbar showArrow={true} arrowLink='/sign-in' />
      <div>
        {invalidToken ? <Redirect to='/sign-in' /> : null}
        {passwordReset.success ? (
          <Redirect
            to={{
              pathname: '/sign-in',
              state: { passwordReset },
            }}
          />
        ) : null}
        <div style={resetStyles}>
          <h2 className='align-center'>
            Hello <span style={{ textTransform: 'capitalize' }}>{name}</span> you can now
            reset your password
          </h2>
          {resetPasswordForm()}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
