'use client';

import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { Button, Title, ActionIcon } from 'rizzui';
import CreateCategory from '@/app/shared/ecommerce/category/create-category';
import { PiPlusBold, PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';

export function CreateCategoryModalView({
  id,
  category,
}: {
  id?: any;
  category?: any;
}) {
  const { closeModal } = useModal();
  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-7 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          {category ? 'Edit Category' : 'Add Category'}
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <CreateCategory id={id} category={category} isModalView={false} />
    </div>
  );
}

type PageHeaderTypes = {
  title: string;
  breadcrumb: { name: string; href?: string }[];
  className?: string;
  categoryToEdit?: any;
};

export default function CategoryPageHeader({
  title,
  breadcrumb,
  className,
  categoryToEdit,
}: PageHeaderTypes) {
  const { openModal } = useModal();

  const handleAddCategory = () => {
    openModal({
      view: <CreateCategoryModalView />, // Open empty form for creating a category
      customSize: '720px',
    });
  };

  const handleEditCategory = (category: any) => {
    openModal({
      view: <CreateCategoryModalView category={category} />, // Pass the category data to edit
      customSize: '720px',
    });
  };

  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb} className={className}>
        <Button
          as="span"
          className="mt-4 w-full cursor-pointer @lg:mt-0 @lg:w-auto "
          onClick={handleAddCategory}
        >
          <PiPlusBold className="me-1 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>
    </>
  );
}
