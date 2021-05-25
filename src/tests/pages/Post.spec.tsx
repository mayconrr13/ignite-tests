import { render, screen } from '@testing-library/react'
import { getSession } from 'next-auth/client'
import { mocked } from 'ts-jest/utils'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'

import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')
jest.mock('next-auth/client')

const post = { 
  slug: 'my-post', 
  title: 'My Post', 
  content: '<p>Post content</p>', 
  updatedAt: '10 de Abril'
}

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText('My Post')).toBeInTheDocument()
    expect(screen.getByText('Post content')).toBeInTheDocument()
    expect(screen.getByText('10 de Abril')).toBeInTheDocument()
  })

  it('redirects user if does not have active subscription', async () => {
    const mockedGetSession = mocked(getSession)

    mockedGetSession.mockReturnValueOnce({
      activeSubscription: null
    } as any)

    const response = await getServerSideProps({
      params: { slug: 'my-post'}
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: '/',
          permanent: false
        }
      })
    )
  })

  it('loads initial data', async () => {
    const mockedGetSession = mocked(getSession)

    mockedGetSession.mockReturnValueOnce({
      activeSubscription: 'fake-active-subscription'
    } as any)

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

    const response = await getServerSideProps({
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