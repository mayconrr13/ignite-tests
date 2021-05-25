import { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import Posts, { getStaticProps } from '../../pages/posts'

import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')

const posts = [
  { slug: 'my-post', title: 'My Post', excerpt: 'Post excerpt', updatedAt: '10 de Abril'}
]

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText('My Post')).toBeInTheDocument()
    expect(screen.getByText('Post excerpt')).toBeInTheDocument()
    expect(screen.getByText('10 de Abril')).toBeInTheDocument()
  })

  it('loads initial data', async () => {
    const mockedGetPrismicClient = mocked(getPrismicClient)

    mockedGetPrismicClient.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-post',
            data: {
              title: [
                { type: 'heading', text: 'My Post'}
              ],
              content: [
                { type: 'paragraph', text: 'Post excerpt'}
              ]
            },
            last_publication_date: '04-01-2021'
          }
        ]
      }),
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'my-post',
            title: 'My Post',
            excerpt: 'Post excerpt',
            updatedAt: '01 de abril de 2021',
          }]
        }
      })
    )
  })
})