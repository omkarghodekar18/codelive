import React from 'react'
import Avatar from './Avatar';

function Client({ userName, avatar }) {

  return (
    <div className='text-white mb-4 w-[50px] h-auto flex flex-col justify-between p-1 items-center  ml-[17px]'>
      <Avatar avatar={avatar} />
      <h1 className='text-sm'>{userName}</h1>
    </div>
  )
}

export default Client