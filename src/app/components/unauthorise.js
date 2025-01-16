'use client'

import styled from 'styled-components'
import { Typography, Button } from '@mui/material'
import { useRouter } from 'next/navigation'

const UnauthorizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 2rem;
`

export default function Unauthorise() {
  const router = useRouter()

  return (
    <UnauthorizedContainer>
      <Typography variant="h4">
        You are not authorized to access this page
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => router.push('/')}
      >
        Go to Home
      </Button>
    </UnauthorizedContainer>
  )
}
