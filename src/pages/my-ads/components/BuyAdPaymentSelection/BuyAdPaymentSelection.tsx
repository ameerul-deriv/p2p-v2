import { LabelPairedTrashCaptionBoldIcon } from '@deriv/quill-icons';
import { Button } from '@deriv-com/ui';

import { PaymentMethodWithIcon } from '@/components';
import { api } from '@/hooks';
import { getPaymentMethodObjects } from '@/utils';

import { BuyPaymentMethodsList } from '../BuyPaymentMethodsList';

import './BuyAdPaymentSelection.scss';

type TBuyAdPaymentSelectionProps = {
    onSelectPaymentMethod: (paymentMethod: string, action?: string) => void;
    selectedPaymentMethods: string[];
};

const BuyAdPaymentSelection = ({ onSelectPaymentMethod, selectedPaymentMethods }: TBuyAdPaymentSelectionProps) => {
    // Enabled for payment method modal
    const { data: paymentMethodList } = api.paymentMethods.useGet(false);
    const list = (
        paymentMethodList?.map(paymentMethod => ({
            text: paymentMethod.display_name,
            value: paymentMethod.id,
        })) ?? []
    ).filter(paymentMethod => !selectedPaymentMethods.includes(paymentMethod.value));

    const paymentMethodObjects = getPaymentMethodObjects(paymentMethodList, 'id');
    return (
        <>
            {selectedPaymentMethods?.length > 0 &&
                selectedPaymentMethods.map(method => {
                    const { display_name: name, type } = paymentMethodObjects[method] ?? {};
                    return (
                        <div className='p2p-buy-ad-payment-selection' key={method}>
                            <PaymentMethodWithIcon name={name} type={type} />
                            <Button
                                color='white'
                                onClick={() => onSelectPaymentMethod(method, 'delete')}
                                variant='contained'
                            >
                                <LabelPairedTrashCaptionBoldIcon data-testid='dt_payment_delete_icon' />
                            </Button>
                        </div>
                    );
                })}
            {selectedPaymentMethods?.length < 3 && (
                <BuyPaymentMethodsList list={list} onSelectPaymentMethod={onSelectPaymentMethod} />
            )}
        </>
    );
};

export default BuyAdPaymentSelection;
