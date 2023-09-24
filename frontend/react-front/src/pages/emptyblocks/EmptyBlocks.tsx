import React from 'react'
import { useGetEmptyBlocksResultsQuery } from '../../services/api'

const EmptyBlocks = () => {
    const { data, isLoading } = useGetEmptyBlocksResultsQuery({
      startDate: '2023-08-23T08:13:34.922',
      endDate: '2023-09-25T21:14:43.389',
    })
    if (isLoading) return <div>Loading...</div>
  
    return (
      <table>
       <thead>
          <tr>
              <th>Producer</th>
              <th>Total Empty Blocks</th>
          </tr>
      </thead>
        <tbody>
          {data?.data.map((producer, index) => (
              <tr key={index}>
                  <td>{producer.owner_name}</td>
                  <td>{producer.total_empty}</td>
              </tr>
          ))}
  </tbody>
      </table>
    )
  }
  
  export default EmptyBlocks