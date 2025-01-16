'use client'

import styled from 'styled-components'

const StyledHome = styled.div`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    .image {
        z-index: -1;
        position: absolute;
    }
    .card {
        display: flex;
        justify-content: center;
        text-align: center;
    }
    .title {
        font-size: 24px;
    }
`

export default StyledHome 