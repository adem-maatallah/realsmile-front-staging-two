'use client';

import { Metadata } from 'next';
import PageHeader from '@/app/shared/page-header';
import { Card, Typography, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

const VIDEOS = [
  {
    id: '1033400891',
    title: 'Collage Des Taquets',
    description: 'Apprenez les techniques de base des taquets',
  },
  {
    id: '1033397885',
    title: 'Collage Des Boutons',
    description: 'Guide complet sur le collage des boutons',
  },
  {
    id: '1033396027',
    title: 'Le Stripping',
    description: 'Techniques avancées de stripping',
  },
  {
    id: '1033393554',
    title: 'La Contention Collèe',
    description: 'Manipulation professionnelle du fil',
  },
];

export default function FormationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Formations Vidéos"
        breadcrumb={[
          {
            href: '/',
            name: 'Accueil',
          },
          {
            name: 'Formations',
          },
        ]}
      />

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <Title level={2} className="mb-4 text-3xl font-bold text-gray-900">
              Explorez nos Formations Vidéos
            </Title>
            <Paragraph className="mx-auto max-w-3xl text-xl text-gray-600">
              Découvrez notre collection de formations vidéo professionnelles
              pour améliorer vos compétences
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {VIDEOS.map((video) => (
              <Col xs={24} sm={24} md={12} key={video.id}>
                <Card
                  hoverable
                  className="flex h-full flex-col overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl"
                  cover={
                    <div className="relative pt-[56.25%]">
                      <iframe
                        src={`https://player.vimeo.com/video/${video.id}?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479`}
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                        className="absolute inset-0 h-full w-full"
                        title={video.title}
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <Title level={4} className="mb-2">
                        {video.title}
                      </Title>
                    }
                    description={
                      <Paragraph className="text-gray-600">
                        {video.description}
                      </Paragraph>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </main>
    </div>
  );
}
