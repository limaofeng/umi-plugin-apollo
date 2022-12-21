import React from 'react';
import styles from './index.css';
import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/client';

import UploadDemo from './UploadDemo';

const CONTINENTS_QUERY = gql`
  query {
    users {
      pageSize
      totalCount
      totalPage
      currentPage
      edges {
        node {
          id
          username
        }
      }
    }
  }
`;

const COMMENTS_SUBSCRIPTION = gql`
  subscription OnCommentAdded($stockCodes: [String!]!) {
    stockQuotes(stockCodes: $stockCodes) {
      stockCode
      dateTime
      stockPrice
      stockPriceChange
    }
  }
`;

function TestSub() {
  const { data, loading } = useSubscription(COMMENTS_SUBSCRIPTION, {
    variables: {
      stockCodes: ["IBM", "GOOGL"]
    }
  });
  console.log('TestSub', data, loading);
  return <div>---TestSub--</div>;
}

export default () => {
  const { data, error, loading } = useQuery(CONTINENTS_QUERY);

  console.log('data', data)

  if (error) {
    return <div>Error loading data.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className={styles.normal}>
      <ul>
        {data.users.edges.map((c: any) => (
          <li key={c.node.id}>
            {c.node.id} - {c.node.username}
          </li>
        ))}
      </ul>
      <UploadDemo />
      <TestSub />
    </div>
  );
};
