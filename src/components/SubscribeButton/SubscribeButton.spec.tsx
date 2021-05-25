import { fireEvent, render, screen } from '@testing-library/react'
import { SubscribeButton } from '.'

import { signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { mocked } from 'ts-jest/utils'

jest.mock('next-auth/client')
jest.mock('next/router')

describe('SubscribeButton component', () => {
  it('renders correctly when user is not authenticated', () => {
    const mockedUseSection = mocked(useSession)

    mockedUseSection.mockReturnValueOnce([null, false])

    const { getByText } = render(
      <SubscribeButton />
    )

    expect(getByText('Subscribe now')).toBeInTheDocument()
  })

  it('redirects user to sign in page when not authenticated', () => {
    const mockedUseSection = mocked(useSession)

    mockedUseSection.mockReturnValueOnce([null, false])

    const mockedSignInFunction = mocked(signIn)

    render(
      <SubscribeButton />
    )

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(mockedSignInFunction).toHaveBeenCalled()
  })

  it('redirects to posts page when user already have an active subscription', () => {

    const mockedUseSession = mocked(useSession)

    const mockedUseRouter = mocked(useRouter)
    const mockedPush = jest.fn()

    mockedUseSession.mockReturnValueOnce([{
      user: {
        name: 'John Doe',
        email: 'johndoe@email.com',        
      },
      activeSubscription: 'fake-active-subscription',
      expires: 'fake-expires'
      }, 
      false
    ] as any)

    mockedUseRouter.mockReturnValueOnce({
      push: mockedPush
    } as any)

    render(
      <SubscribeButton />
    )

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(mockedPush).toHaveBeenCalledWith('/posts')
  })
})
