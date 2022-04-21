import { GetStaticPathsResult, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { WiTime2 } from 'react-icons/wi';
import { getPrismicClient } from '../../services/prismic';
import DateFormat from '../../utils/dateFormated';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): any {
  const router = useRouter();

  function calculateEstimatedReadingTime(): string {
    const wordsPerMinute = 200;
    const words = post.data.content.reduce((acc, curr) => {
      curr.body.forEach(paragraph => {
        acc += Number(paragraph?.text?.split(' ').length);
      });
      return acc;
    }, 0);
    const minutes = words / wordsPerMinute;
    return `${Math.ceil(minutes)} min`;
  }

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router?.isFallback) {
    return (
      <div>
        <span>Carregando...</span>
      </div>
    );
  }

  return (
    <>
      <img className={styles.banner} src={post?.data?.banner?.url} alt="logo" />

      <main className={styles.container}>
        <div className={styles.post}>
          <h1>{post?.data?.title}</h1>
          <div className={styles.info}>
            <div className={styles.createdAt}>
              <FiCalendar color="#D7D7D7" />
              <span>{DateFormat(post?.first_publication_date)}</span>
            </div>
            <div className={styles.author}>
              <FiUser color="#D7D7D7" />
              <span>{post?.data?.author}</span>
            </div>
            <div className={styles.time}>
              <WiTime2 color="#D7D7D7" />
              <span>{calculateEstimatedReadingTime()}</span>
            </div>
          </div>

          <div className={styles.content}>
            {post?.data?.content?.map((item, i) => {
              return (
                <div key={i}>
                  <h2>{item?.heading}</h2>
                  {item?.body?.map((paragraph, i) => {
                    return <p key={i}>{paragraph?.text}</p>;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths = (): GetStaticPathsResult => {
  return {
    paths: [
      {
        params: {
          slug: 'como-utilizar-hooks',
        },
      },
      {
        params: {
          slug: 'criando-um-app-cra-do-zero',
        },
      },
    ],
    fallback: true, // false or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'post-jobs-in-plain-english',
    String(slug),
    {}
  );

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 30, // minutos
  };
};
