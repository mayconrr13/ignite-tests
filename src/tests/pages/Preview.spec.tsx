import { render, screen } from '@testing-library/react'
import { getSession, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { mocked } from 'ts-jest/utils'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'

import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')
jest.mock('next-auth/client')
jest.mock('next/router')

const post = { 
  slug: 'my-post', 
  title: 'My Post', 
  content: '<p>Post content</p>', 
  updatedAt: '10 de Abril'
}

describe('Post preview page', () => {
  it('renders correctly', () => {
    const mockedUseSession = mocked(useSession)

    mockedUseSession.mockReturnValueOnce([
      null, 
      false
  ])
  
    render(<Post post={post} />)

    expect(screen.getByText('My Post')).toBeInTheDocument()
    expect(screen.getByText('Post content')).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reading ?')).toBeInTheDocument()
  })

  it('redirects user if does have active subscription', async () => {
    const mockedUseSession = mocked(useSession)

    mockedUseSession.mockReturnValueOnce([
      { activeSubscription: 'fake-active-subscription' },
      false
    ] as any)

    const mockedUseRouter = mocked(useRouter)
    const mockedPush = jest.fn()

    mockedUseRouter.mockReturnValueOnce({
      push: mockedPush
    } as any)

    render(<Post post={post} />)

    expect(mockedPush).toHaveBeenCalledWith('/posts/my-post')    
  })

  it('loads initial data', async () => {
    const mockedGetPrismicClient = mocked(getPrismicClient)

    mockedGetPrismicClient.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My Post'}
          ],
          content: [
            { type: 'paragraph', text: 'Post content'}
          ]
        },
        last_publication_date: '04-01-2021'
      })
    } as any)

    const response = await getStaticProps({
      params: { slug: 'my-post'}
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-post', 
            title: 'My Post', 
            content: '<p>Post content</p>', 
            updatedAt: '01 de abril de 2021'
            }
        }
      })
    )
  })
})