'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/utils/firestore/db';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

const NotificationsContext = createContext({
  notifications: [],
  setNotifications: () => {},
  loading: true,
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
});

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth()

  let notificationsPath;
  user?.role === 'doctor'
    ? (notificationsPath = `customers/${user?.id}/customernotifications`)
    : (notificationsPath = `agents/${user?.id}/agentnotifications`);

  useEffect(() => {
    if (!user || !notificationsPath) return undefined;

    const fetchInitialNotifications = async () => {
      try {
        const notificationsQuery = query(collection(db, notificationsPath));
        const querySnapshot = await getDocs(notificationsQuery);
        const initialNotifications =
          querySnapshot.docs[0]?.data()?.list.sort((a, b) => b.xd1 - a.xd1) ||
          [];
        setNotifications(initialNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial notifications:', error);
        setLoading(false);
      }
    };

    const listenForNotificationChanges = () => {
      const notificationsQuery = query(collection(db, notificationsPath));

      return onSnapshot(
        notificationsQuery,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const updatedDocument = change.doc.data();
            const updatedNotifications = updatedDocument.list;

            setNotifications((prevNotifications) => {
              if (change.type === 'added' || change.type === 'modified') {
                return updatedNotifications.sort((a, b) => b.xd1 - a.xd1);
              }
              return prevNotifications;
            });

            if (change.type === 'modified') {
              const updatedNotification = updatedNotifications.find(
                (notification) => notification.xd1 === change.doc.xd1
              );

              toast.custom((t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
                >
                  <div className="w-0 flex-1 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={
                            updatedNotification?.xa5 ||
                            'https://storage.googleapis.com/realsmilefiles/staticFolder/staticNotif.png'
                          }
                          alt=""
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {updatedNotification?.xa2}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {updatedNotification?.xa3}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-gray-200">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ));
            }
          });
        },
        (error) => {
          console.error('Error listening for notifications:', error);
        }
      );
    };

    fetchInitialNotifications();
    const unsubscribe = listenForNotificationChanges();

    return () => unsubscribe();
  }, [user?.id, notificationsPath]);

  const markNotificationAsRead = async (notificationId) => {
    const docRef = doc(db, notificationsPath);
    const docSnap = await getDoc(docRef);
    const notificationsList = docSnap.data().list;

    const updatedList = notificationsList.map((notification) =>
      notification.xd1 === notificationId
        ? { ...notification, xf4: true }
        : notification
    );

    await updateDoc(docRef, { list: updatedList });
    setNotifications(updatedList);
  };

  const markAllNotificationsAsRead = async () => {
    const docRef = doc(db, notificationsPath);
    const docSnap = await getDoc(docRef);
    const notificationsList = docSnap.data().list;

    const updatedList = notificationsList.map((notification) => ({
      ...notification,
      xf4: true,
    }));

    await updateDoc(docRef, { list: updatedList });
    setNotifications(updatedList);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        loading,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export { NotificationsContext };

export const useNotifications = () => useContext(NotificationsContext);
