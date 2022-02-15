import 'antd/dist/antd.min.css'
import Head from 'next/head'
import Link from 'next/link'
import { BackTop, Button, Divider, Row, Col, Table, Tooltip, Tag } from 'antd'
import { ReloadOutlined, FacebookOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import axios from 'axios'

export default function Home() {
  const timezone = 'Asia/Bangkok'
  const [isLoading, setLoading] = useState(false)
  const [ranked, setRanked] = useState([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(DateTime.local({ zone: timezone }))

  const getRanked = async () => {
    setLoading(true)
    const { data } = await axios.get('/api/votes')

    setLastUpdated(DateTime.fromISO(data.updatedAt, { zone: timezone }))
    setTotalVotes(data.ranked.reduce((current, data) => current += +data.vote, 0))
    setRanked(data.ranked.map((data, index) => {
      return {
        key: index,
        rank: (index + 1),
        ...data
      }
    }))
    setLoading(false)
  }

  const renderVote = (vote = 0, placement = "left", digits = 3) => (
    <Tooltip title={vote} color="blue" placement={placement}>
      <a>{Number(vote).toLocaleString(undefined, { minimumFractionDigits: digits })}</a>
    </Tooltip>
  )

  useEffect(() => {
    getRanked()
  }, [])

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      dataIndex: 'rank',
      width: '15%',
      sorter: {
        compare: (a, b) => a.rank - b.rank,
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filters: ranked.map(record => {
        return {
          text: record.name,
          value: record.name,
        }
      }),
      filterSearch: true,
      onFilter: (value, record) => record.name.includes(value),
      width: '45%',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Vote (BNK)',
      dataIndex: 'vote',
      key: 'vote',
      align: 'right',
      sorter: {
        compare: (a, b) => a.vote - b.vote,
      },
      width: '40%',
      render: (vote) => renderVote(vote)
    }
  ]

  return (
    <div>
      <Head>
        <title>Debut Ranked - BNK48 3rd Generation</title>
        <meta name="description" content="a real time debut votes ranked of bnk48 3rd generation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <BackTop visibilityHeight={100} />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
        <Row justify="space-between" style={{ margin: '10px 0 20px 0' }}>
          <Col span={18}>
            <div className="updated-at">
              Updated: <strong>{lastUpdated.toFormat('dd LLL yyyy, HH:mm:ss')}</strong>
            </div>
            <div className="total-votes">
              Total Votes: <strong>{renderVote(totalVotes, 'bottom')}</strong> BNK
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              loading={isLoading}
              onClick={() => getRanked()}
              icon={<ReloadOutlined />}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              loading={isLoading}
              dataSource={ranked}
              columns={columns}
              pagination={false}
              bordered
              size="small"
            />
          </Col>
        </Row>
        <Divider />
      </div>
    </div>
  )
}
