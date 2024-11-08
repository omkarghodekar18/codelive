import React from 'react'

function Avatar({avatar}) {
    return (
        <div className='w-[50px] h-[50px]'><img src={avatar} alt='avatar' /></div>
    )
}

export default Avatar