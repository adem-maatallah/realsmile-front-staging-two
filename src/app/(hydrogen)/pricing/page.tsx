'use client';
import React, { useState, useEffect } from 'react';
import './pricing-table.css';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/utils/axiosInstance';

const PricingTable = () => {
  const [pricingData, setPricingData] = useState([]);
  const { user } = useAuth();

  const productDetails = {
    'RealSmile Bronze': [
      '6 mois de traitement',
      '12 aligneurs par arcade',
      'Une finition incluse',
    ],
    'RealSmile Silver': [
      '1 an de traitement',
      '24 aligneurs par arcade',
      '2 finitions',
    ],
    'RealSmile Gold': [
      '2 ans de traitement',
      '48 aligneurs par arcade',
      '2 finitions',
    ],
    'RealSmile Platinum': [
      'Cas complexes',
      'Nombre d’aligneurs illimité',
      'Finitions Illimitées pendant 4 ans',
    ],
    'RealSmile ONE Arch.': ['12 aligneurs', 'Une finition'],
    'RealSmile Unitaire': ['Aligneur'],
  };

  const getCurrencySymbol = () => {
    switch (user?.country) {
      case 'TN':
        return 'د.ت';
      case 'MA':
        return 'د.م';
      default:
        return '€';
    }
  };

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/packs`
        );
        const { data } = await response.data;
        setPricingData(data); // Keep all data including SmileSet
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
        setPricingData([]); // Set empty array on error
      }
    };

    if (user) {
      fetchPricingData();
    }
  }, [user]); // Dependency array includes session.accessToken

  // Find SmileSet specifically for special rendering
  const smileSet = pricingData.find((pack) => pack.name === 'SmileSet');
  // Find the additional items to be displayed under SmileSet
  const additionalItems = pricingData.filter((pack) =>
    [
      'Perte ou casse de gouttières',
      'Gouttières de contention',
      'Fil de contention Realsmile',
    ].includes(pack.name)
  );

  // Exclude SmileSet and additional items from the main list when rendering
  const mainPacks = pricingData.filter(
    (pack) =>
      ![
        'SmileSet',
        'Perte ou casse de gouttières',
        'Gouttières de contention',
        'Fil de contention Realsmile',
      ].includes(pack.name)
  );
  const currencySymbol = getCurrencySymbol(); // Get the currency symbol to be used

  return (
    <div className="pricing-table-wrapper">
      <ul className="pricing-table">
        {mainPacks.map((pack) => (
          <li
            key={pack.id}
            className={`pricing-table__item ${pack.name === 'RealSmile Silver' ? 'pricing-table__item--popular' : ''}`}
          >
            <Image
              width={150}
              height={150}
              src={`/pricing-assets/${pack.id}.svg`}
              alt={`${pack.name} Package`}
            />
            <h3 className="pricing-table__title">{pack.name}</h3>
            <p className="pricing-table__description">
              <span className="pricing-table__price">
                {pack.price} {currencySymbol}
              </span>
            </p>
            <ul className="pricing-table__products">
              {productDetails[pack.name]?.map((product, index) => (
                <li key={index} className="pricing-table__product">
                  <Link href="#">{product}</Link>
                </li>
              ))}
            </ul>
            <Link href="/cases/create" className="pricing-table__button">
              Créer un dossier
            </Link>
          </li>
        ))}
      </ul>
      {smileSet && (
        <div className="pricing-table__item">
          <Image
            width={150}
            height={150}
            src={`/pricing-assets/${smileSet.id}.svg`}
            alt="SmileSet Package"
          />
          <h3 className="pricing-table__title">{smileSet.name}</h3>
          <p className="pricing-table__description">
            <span className="pricing-table__price" style={{ color: '#C19F69' }}>
              {smileSet.price} {currencySymbol}
            </span>
          </p>
          <ul className="pricing-table__products">
            {additionalItems.map((item) => (
              <li key={item.id} className="pricing-table__product">
                <Link href="#">
                  {item.name} - {item.price} {currencySymbol}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PricingTable;
