'use client'
import React, { FC, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { AiOutlineEye, AiOutlineEyeInvisible, AiFillGithub } from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import { styles } from '@/app/styles/style'
import { useRegisterMutation } from '@/redux/features/auth/authApi'
import toast from 'react-hot-toast'

type Props = {
  setRoute: (route:string) => void;
}

const schema = Yup.object().shape({
  name: Yup.string().required('Please enter your name!'),
  email: Yup.string().email("Invalid email address").required('Please enter your email!'),
  password: Yup.string().required("Please enter your password!").min(6),
})

const SignUp: FC<Props> = ({setRoute}) => {

  const [show, setShow] = useState(false);
  const [register, {data, isSuccess, error}] = useRegisterMutation();

  useEffect(() => {
    if(isSuccess) {
      const message = data?.message || 'Registration Successfully';
      toast.success(message);
      setRoute('Verification');
    }
    if (error) {
      if('data' in error){
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error, data?.message, setRoute]);

  const formik = useFormik({
    initialValues: { name:'', email:'', password:'' },
    validationSchema: schema,
    onSubmit: async({ name, email, password }) => {
      const data = {
        name, email, password
      }
      await register(data)
    }
  })

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className='w-full'>
      <h1 className={`${styles.title}`}>
        Join to DatamindUD
      </h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label htmlFor="name" className={`${styles.label}`}>
            Enter your Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={values.name}
            placeholder='datamind Ud'
            onChange={ handleChange }
            className={`${
              errors.name && touched.name && 'border-red-500'
            } ${styles.input}`}
          />
          {
            errors.name && touched.name && (
              <span className={`${styles.span}`}>{errors.name}</span>
            )
          }
        </div>
        <label htmlFor="email" className={`${styles.label}`}>
          Enter your email address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={values.email}
          placeholder='datamind@gmail.com'
          onChange={ handleChange }
          className={`${
            errors.email && touched.email && 'border-red-500'
          } ${styles.input}`}
        />
        {
          errors.email && touched.email && (
            <span className={`${styles.span}`}>{errors.email}</span>
          )
        }
        <div className='w-full mt-5 relative mb-1'>
          <label htmlFor="password" className={`${styles.label}`}>
            Enter your password
          </label>
          <input
            type={ !show ? "password" : "text" }
            name="password"
            id="password"
            value={ values.password }
            onChange={ handleChange }
            placeholder='password!@%'
            className={`${
              errors.password && touched.password && 'border-red-500'
            } ${styles.input}`}
          />
          {!show ? (
            <AiOutlineEyeInvisible
              className='absolute bottom-3 right-2 z-1 cursor-pointer'
              size={20}
              onClick={() => setShow(true)}
            />
          ) : (
            <AiOutlineEye
              className='absolute bottom-3 right-2 z-1 cursor-pointer'
              size={20}
              onClick={() => setShow(false)}
            />
          )}
          { errors.password && touched.password && (
            <span className={`${styles.span}`}>{errors.password}</span>
          )}
        </div>
        <div className='w-full mt-5'>
          <input type="submit" value="Sign Up" className={`${styles.button}`}/>
        </div>
        <br />
        <h5 className={`${styles.h5}`}>
          Or join with
        </h5>
        <div className='flex items-center justify-center my-3'>
          <FcGoogle size={30} className='cursor-pointer mr-2'/>
          <AiFillGithub size={30} className='cursor-pointer ml-2'/>
        </div>
        <h5 className={`${styles.h5}`}>
          Already have an account?{' '}
          <span
            className='text-[#2190ff] pl-1 cursor-pointer'
            onClick={() => setRoute('Login')}
          >
            Sign In
          </span>
        </h5>
      </form>
      <br />
    </div>
  )
}

export default SignUp