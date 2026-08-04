import { CustomText } from '../ui/CustomText';

export const PayoutSectionTitle = ({ title }: { title: string }) => {
  return (
    <CustomText
      type='h3'
      className='text-cinnabar'
    >
      {title}
    </CustomText>
  );
};
