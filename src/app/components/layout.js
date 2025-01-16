'use client'

import Header from './header'
import styled from 'styled-components'

const Main = styled.main`
  padding: 2rem;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
`

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <Main>{children}</Main>
    </>
  )
}
