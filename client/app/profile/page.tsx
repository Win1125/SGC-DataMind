/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import React, { FC, useState } from 'react'
import Protected from '../hooks/useProtected';
import Heading from '../utils/Heading';
import Header from '../components/Header';
import Profile from '../components/Profile/Profile';
import { useSelector } from 'react-redux';

type Props = {}

const page:FC<Props> = (props) => {

  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(5);
  const [route, setRoute] = useState("Login");
  const {user} = useSelector((state:any) => state.auth);

  return (
    <div>
      <Protected>
        <Heading
          title={`${user?.name} profile`}
          description=""
          keywords="Programming, Software Engineering, Universidad, Distrital, Francisco José de Caldas, Universidad Distrital, Universidad Distrital Francisco José de Caldas, SGC, Sistema, Gestión, Conocimiento, Sistema de Gestión de Conocimiento"
        />
        <Header
          open={open}
          setOpen={setOpen}
          activeItem={activeItem}
          setRoute={setRoute}
          route={route}
        />
        <Profile user={user} />
      </Protected>
    </div>
  )
}

export default page;