import { useQuery, useSubscription } from '@apollo/client';
import gql from 'graphql-tag';

const CONTINENTS_QUERY = gql`
  query {
    users {
      id
      userType
      name
      username
      password
      phone {
        number
        status
      }
    }
  }
`;

export default function HomePage() {

  const { data, error, loading } = useQuery(CONTINENTS_QUERY);

  console.log('data', data)


  if (error) {
    return <div>Error loading data.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Yay! Welcome to umi!</h2>
      <ul style={{listStyleType: 'none' }}>
        {data.users.map((c: any) => (
          <li key={c.id}>
            {c.id} - {c.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
