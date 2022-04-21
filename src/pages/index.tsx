import { GetStaticProps } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import DateFormat from '../utils/dateFormated';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): any {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNextPagination(): Promise<void> {
    const res = await fetch(nextPage).then(function (response) {
      return response.json();
    });

    const data = res?.results?.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post?.first_publication_date,
        data: {
          title: String(post?.data?.title),
          subtitle: String(post?.data?.subtitle),
          author: String(post?.data?.author),
        },
      };
    });

    setNextPage(res?.next_page);
    setPosts([...data, ...posts]);
  }

  return (
    <>
      <main className={commonStyles.content}>
        {posts?.map(post => (
          <div key={post?.uid} className={commonStyles.post}>
            <Link href={`/post/${post?.uid}`}>
              <h1>{post?.data?.title}</h1>
            </Link>
            <p>{post?.data?.subtitle}</p>
            <div className={commonStyles.info}>
              <div className={commonStyles.createdAt}>
                <FiCalendar color="#D7D7D7" />
                <span>{DateFormat(post?.first_publication_date)}</span>
              </div>
              <div className={commonStyles.author}>
                <FiUser color="#D7D7D7" />
                <span>{post?.data?.author}</span>
              </div>
            </div>
          </div>
        ))}
      </main>
      {nextPage && (
        <nav className={styles.pagination}>
          <a type="button" onClick={handleNextPagination} href="#">
            Carregar mais posts
          </a>
        </nav>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.getByType('post-jobs-in-plain-english', {
    pageSize: 2,
  });

  const posts = response?.results?.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post?.first_publication_date,
      data: {
        title: String(post?.data?.title),
        subtitle: String(post?.data?.subtitle),
        author: String(post?.data?.author),
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: response?.next_page,
        results: posts,
      },
    },
  };
};
