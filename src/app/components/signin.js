'use client'

import styled from 'styled-components'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { Button } from '@mui/material'

const SigninContainer = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
`;

const SigninCard = styled.div`
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;

    .logo {
        margin-bottom: 1rem;
    }

    .title {
        margin-bottom: 2rem;
        color: #333;
    }
`;

export default function Sign() {
    return (
        <SigninContainer>
            <SigninCard>
                <Image 
                    src="/logo.jpg" 
                    alt="NITP Logo" 
                    width={100} 
                    height={100} 
                    priority={true}
                />
                <h1 className="title">Admin Portal</h1>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => signIn('google')}
                >
                    Sign in with Google
                </Button>
            </SigninCard>
        </SigninContainer>
    )
}
