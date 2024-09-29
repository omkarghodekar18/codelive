import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';

function Avatar({avatar}) {
    return (
        <div className='w-[50px] h-[50px]'><img src={avatar} /></div>
    )
}

export default Avatar