'use client'

import styled from 'styled-components'

const StyledFooter = styled.footer`
  padding: 1rem;
  text-align: center;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
`

export default function Footer() {
  return (
    <StyledFooter>
      <p>© {new Date().getFullYear()} NITP. All rights reserved.</p>
    </StyledFooter>
  )
}
