'use client'

import styled from 'styled-components'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { Button } from '@mui/material'

const SigninPage = styled.div`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .signin-container {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .logo {
        margin-bottom: 2rem;
    }

    .title {
        font-size: 1.5rem;
        margin-bottom: 2rem;
        color: #333;
    }
`

export default function Sign() {
    return (
        <SigninPage>
            <div className="signin-container">
                <Image 
                    src="/logo.jpg" 
                    alt="NITP Logo" 
                    width={100} 
                    height={100} 
                    className="logo"
                />
                <h1 className="title">Admin Portal</h1>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => signIn('google')}
                >
                    Sign in with Google
                </Button>
            </div>
        </SigninPage>
    )
}
