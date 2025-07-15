import { ROLES } from '@/config/constants';
import { avatarIds } from '@/utils/get-avatar';
import { getRandomArrayElement } from '@/utils/get-random-array-element';

export const users = [
  {
    id: 1,
    role: ROLES.Administrateur,
    avatar: `https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-${getRandomArrayElement(
      avatarIds
    )}.webp`,
  },
  {
    id: 2,
    role: ROLES.Administrateur,
    avatar: `https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-${getRandomArrayElement(
      avatarIds
    )}.webp`,
  },
  {
    id: 3,
    role: ROLES.Administrateur,
    avatar: `https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-${getRandomArrayElement(
      avatarIds
    )}.webp`,
  },
  {
    id: 4,
    role: ROLES.Administrateur,
    avatar: `https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-${getRandomArrayElement(
      avatarIds
    )}.webp`,
  },
  {
    id: 5,
    role: ROLES.Administrateur,
    avatar: `https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-${getRandomArrayElement(
      avatarIds
    )}.webp`,
  },
  {
    id: 6,
    role: ROLES.Administrateur,
    avatar: `https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-${getRandomArrayElement(
      avatarIds
    )}.webp`,
  },
];

export const rolesList = [
  {
    name: ROLES.Administrateur,
    color: '#2465FF',
    users,
  },
  {
    name: ROLES.Praticien,
    color: '#F5A623',
    users,
  },
  {
    name: ROLES.Labo,
    color: '#FF1A1A',
    users,
  },
  {
    name: ROLES.Patient,
    color: '#8A63D2',
    users,
  },
  {
    name: ROLES.Financier,
    color: '#FF1A1A',
    users,
  },
  {
    name: ROLES.Agent,
    color: '#11A849',
    users,
  },
];

export const roleActions = [
  {
    id: 1,
    name: 'Ajouter un utilisateur',
  },
  {
    id: 2,
    name: 'Renommer',
  },
  {
    id: 3,
    name: 'Supprimer le Role',
  },
];
