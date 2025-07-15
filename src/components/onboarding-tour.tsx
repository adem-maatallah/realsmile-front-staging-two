'use client';

import React from 'react';
import Joyride, { STATUS, Step, CallBackProps } from 'react-joyride';
import { useAuth } from '@/context/AuthContext';

const getStepsForRole = (role) => {
  const commonSteps: Step[] = [
    {
      target: '.sidebar-menu',
      content:
        'Utilisez ce menu pour naviguer entre les différentes sections de votre tableau de bord.',
    },
    {
      target: '.search-bar',
      content:
        'Recherchez rapidement des pages et des fonctionnalités en utilisant cette barre de recherche.',
    },
    {
      target: '.user-country',
      content:
        'Le pays de l’utilisateur est utilisé pour générer les devis et les factures.',
    },
    {
      target: '.messages',
      content: 'Consultez vos messages importants ici.',
    },
    {
      target: '.notifications',
      content: 'Toutes vos notifications apparaîtront ici.',
    },
    {
      target: '.settings-dropdown',
      content:
        'Accédez aux paramètres et à d’autres options depuis ce menu déroulant.',
    },
  ];

  const roleSpecificSteps = {
    doctor: [
      {
        target: '.cases-statuses',
        content: 'Consultez le nombre de vos cas classés par statut.',
      },
      {
        target: '.recent-cases',
        content: 'Consultez vos cas récents ici.',
      },
      {
        target: '.cases-by-age-gender',
        content:
          "Consultez les statistiques de vos cas par tranche d'âge et sexe.",
      },
    ],
  };

  return role === 'doctor'
    ? [...commonSteps, ...roleSpecificSteps[role]]
    : commonSteps;
};

const OnboardingTour = () => {
  const {user} = useAuth()
  const userRole = user?.role;

  const steps = getStepsForRole(userRole);

  const [run, setRun] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);
  const [elementsLoaded, setElementsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      // Check if the elements are loaded
      const interval = setInterval(() => {
        const allElementsLoaded = steps.every((step) =>
          document.querySelector(step.target)
        );
        if (allElementsLoaded) {
          setElementsLoaded(true);
          clearInterval(interval);
          setRun(true);
        }
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [steps]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, status, index, type } = data;

    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
    } else if (type === 'step:after') {
      if (action === 'prev') {
        setStepIndex(index - 1);
      } else {
        setStepIndex(index + 1);
      }
    }
  };

  if (!isMounted || !elementsLoaded) return null;

  const primaryColor = '#FFC107'; // Update this with your primary color
  const secondaryColor = '#FF5722'; // Update this with your secondary color

  return (
    <Joyride
      steps={steps}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor, // Custom primary color
          textColor: '#333', // Custom text color
          overlayColor: 'rgba(0, 0, 0, 0.5)', // Custom overlay color
          spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)', // Custom spotlight shadow
          width: 300, // Custom width
        },
        buttonNext: {
          backgroundColor: primaryColor, // Custom next button color
          color: '#fff',
        },
        buttonBack: {
          marginRight: 10,
          backgroundColor: secondaryColor, // Custom back button color
          color: '#fff',
        },
        buttonSkip: {
          color: secondaryColor, // Custom skip button color
        },
      }}
      locale={{
        back: 'Retour',
        close: 'Fermer',
        last: 'Fin',
        next: 'Suivant',
        skip: 'Passer',
      }}
    />
  );
};

export default OnboardingTour;
