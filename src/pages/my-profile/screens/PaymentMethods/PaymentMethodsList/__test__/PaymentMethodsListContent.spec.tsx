import { ComponentProps } from 'react';
import { THooks } from 'types';

import { APIProvider, AuthProvider } from '@deriv/api-v2';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PaymentMethodErrorModal, PaymentMethodModal } from '@/components/Modals';
import { api } from '@/hooks';

import { PaymentMethodsListContent } from '../PaymentMethodsListContent';

const wrapper = ({ children }: { children: JSX.Element }) => (
    <APIProvider>
        <AuthProvider>
            <div id='v2_modal_root'>{children}</div>
        </AuthProvider>
    </APIProvider>
);

jest.mock('@deriv/api-v2', () => ({
    ...jest.requireActual('@deriv/api-v2'),
    p2p: {
        advertiserPaymentMethods: {
            useDelete: jest.fn(),
        },
    },
}));

const mockPaymentMethodsData: THooks.AdvertiserPaymentMethods.Get = [
    {
        display_name: 'Other',
        fields: {
            account: {
                display_name: 'Account 1',
                required: 0,
                type: 'text',
                value: 'Account 1',
            },
        },
        id: 'other',
        is_enabled: 1,
        method: 'other',
        type: 'other',
        used_by_adverts: null,
        used_by_orders: null,
    },
    {
        display_name: 'Other 1',
        fields: {
            account: {
                display_name: 'Account 2',
                required: 0,
                type: 'text',
                value: 'Account 2',
            },
        },
        id: 'other1',
        is_enabled: 1,
        method: 'other1',
        type: 'other',
        used_by_adverts: null,
        used_by_orders: null,
    },
];

const mockUseDeleteResponse: ReturnType<typeof api.advertiserPaymentMethods.useDelete> = {
    context: undefined,
    data: undefined,
    delete: jest.fn(),
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isIdle: false,
    isLoading: false,
    isPaused: false,
    isSuccess: true,
    mutateAsync: () => Promise.resolve({}),
    reset: () => undefined,
    status: 'success',
    variables: undefined,
};

jest.mock('@/components/Modals', () => ({
    ...jest.requireActual('@/components/Modals'),
    PaymentMethodErrorModal: jest.fn(({ isModalOpen, onConfirm }: ComponentProps<typeof PaymentMethodErrorModal>) => {
        return isModalOpen ? (
            <div>
                <span>PaymentMethodErrorModal</span>
                <button data-testid='dt_payment_method_error_ok_button' onClick={onConfirm}>
                    Ok
                </button>
            </div>
        ) : null;
    }),
    PaymentMethodModal: jest.fn(({ isModalOpen, onConfirm, onReject }: ComponentProps<typeof PaymentMethodModal>) => {
        return isModalOpen ? (
            <div>
                <span>PaymentMethodModal</span>
                <button data-testid='dt_payment_method_confirm_button' onClick={onConfirm}>
                    Confirm
                </button>
                <button data-testid='dt_payment_method_reject_button' onClick={onReject}>
                    Reject
                </button>
            </div>
        ) : null;
    }),
}));

const mockUseDelete = api.advertiserPaymentMethods.useDelete as jest.MockedFunction<
    typeof api.advertiserPaymentMethods.useDelete
>;

describe('PaymentMethodsListContent', () => {
    it('should render the component correctly', () => {
        mockUseDelete.mockReturnValueOnce(mockUseDeleteResponse);
        render(
            <PaymentMethodsListContent
                formState={{}}
                isMobile={false}
                onAdd={jest.fn()}
                onDelete={jest.fn()}
                onEdit={jest.fn()}
                onResetFormState={jest.fn()}
                p2pAdvertiserPaymentMethods={[]}
            />,
            { wrapper }
        );
        expect(screen.getByText('Add new')).toBeInTheDocument();
    });
    it('should render the component when p2padvertiserpaymentmethods are provided', () => {
        mockUseDelete.mockReturnValueOnce(mockUseDeleteResponse);
        render(
            <PaymentMethodsListContent
                formState={{}}
                isMobile={false}
                onAdd={jest.fn()}
                onDelete={jest.fn()}
                onEdit={jest.fn()}
                onResetFormState={jest.fn()}
                p2pAdvertiserPaymentMethods={mockPaymentMethodsData}
            />,
            { wrapper }
        );
        expect(screen.getByText('Others')).toBeInTheDocument();
        expect(screen.getByText('Account 1')).toBeInTheDocument();
        expect(screen.getByText('Account 2')).toBeInTheDocument();
    });
    it('should handle edit when the edit menu item is clicked', async () => {
        mockUseDelete.mockReturnValue(mockUseDeleteResponse);
        const onEdit = jest.fn();
        render(
            <PaymentMethodsListContent
                formState={{ actionType: 'EDIT' }}
                isMobile={false}
                onAdd={jest.fn()}
                onDelete={jest.fn()}
                onEdit={onEdit}
                onResetFormState={jest.fn()}
                p2pAdvertiserPaymentMethods={[mockPaymentMethodsData[0]]}
            />,
            { wrapper }
        );
        await userEvent.click(screen.getByTestId('dt_flyout_toggle'));
        const editMenuItem = screen.getByText('Edit');
        expect(editMenuItem).toBeInTheDocument();
        await userEvent.click(editMenuItem);
        expect(onEdit).toBeCalled();
    });
    it('should handle delete when the delete menu item is clicked', async () => {
        mockUseDelete.mockReturnValue(mockUseDeleteResponse);
        const onDelete = jest.fn();
        render(
            <PaymentMethodsListContent
                formState={{ actionType: 'DELETE' }}
                isMobile={false}
                onAdd={jest.fn()}
                onDelete={onDelete}
                onEdit={jest.fn()}
                onResetFormState={jest.fn()}
                p2pAdvertiserPaymentMethods={[mockPaymentMethodsData[0]]}
            />,
            { wrapper }
        );
        await userEvent.click(screen.getByTestId('dt_flyout_toggle'));
        const deleteMenuItem = screen.getByText('Delete');
        expect(deleteMenuItem).toBeInTheDocument();
        await userEvent.click(deleteMenuItem);
        expect(onDelete).toBeCalled();
    });

    it('should handle confirm when the confirm button is clicked on the payment method modal and delete status is successful', async () => {
        const onResetFormState = jest.fn();
        mockUseDelete.mockReturnValue({
            ...mockUseDeleteResponse,
            isSuccess: true,
            status: 'success',
        });
        render(
            <PaymentMethodsListContent
                formState={{ actionType: 'DELETE' }}
                isMobile={false}
                onAdd={jest.fn()}
                onDelete={jest.fn()}
                onEdit={jest.fn()}
                onResetFormState={onResetFormState}
                p2pAdvertiserPaymentMethods={[
                    {
                        display_name: 'Other',
                        fields: {
                            account: {
                                display_name: 'Account 1',
                                required: 0,
                                type: 'text',
                                value: 'Account 1',
                            },
                        },
                        id: 'other',
                        is_enabled: 1,
                        method: 'other',
                        type: 'other',
                        used_by_adverts: null,
                        used_by_orders: null,
                    },
                ]}
            />,
            { wrapper }
        );
        await userEvent.click(screen.getByTestId('dt_flyout_toggle'));
        const deleteMenuItem = screen.getByText('Delete');
        expect(deleteMenuItem).toBeInTheDocument();
        await userEvent.click(deleteMenuItem);
        await userEvent.click(screen.getByTestId('dt_payment_method_confirm_button'));
        expect(onResetFormState).toBeCalled();
    });
    it('should hide the modal when the reject button of the modal is clicked', async () => {
        mockUseDelete.mockReturnValue(mockUseDeleteResponse);
        render(
            <PaymentMethodsListContent
                formState={{ actionType: 'DELETE' }}
                isMobile={false}
                onAdd={jest.fn()}
                onDelete={jest.fn()}
                onEdit={jest.fn()}
                onResetFormState={jest.fn()}
                p2pAdvertiserPaymentMethods={[mockPaymentMethodsData[0]]}
            />,
            { wrapper }
        );
        await userEvent.click(screen.getByTestId('dt_flyout_toggle'));
        const deleteMenuItem = screen.getByText('Delete');
        expect(deleteMenuItem).toBeInTheDocument();
        await userEvent.click(deleteMenuItem);
        await userEvent.click(screen.getByTestId('dt_payment_method_reject_button'));
        expect(screen.queryByText('PaymentMethodModal')).not.toBeInTheDocument();
    });
    it('should show the error modal when delete is unsuccessful and handle on confirm when the ok button is clicked', async () => {
        mockUseDelete.mockReturnValue({
            ...mockUseDeleteResponse,
            error: {
                echo_req: {
                    delete: [101, 102],
                    p2p_advertiser_payment_methods: 1,
                },
                error: {
                    code: 'AuthorizationRequired',
                    message: 'Please log in.',
                },
                msg_type: 'p2p_advertiser_payment_methods',
            },
            isError: true,
            isSuccess: false,
            status: 'error',
        });

        render(
            <PaymentMethodsListContent
                formState={{ actionType: 'DELETE' }}
                isMobile={false}
                onAdd={jest.fn()}
                onDelete={jest.fn()}
                onEdit={jest.fn()}
                onResetFormState={jest.fn()}
                p2pAdvertiserPaymentMethods={[mockPaymentMethodsData[0]]}
            />,
            { wrapper }
        );
        expect(screen.queryByText('PaymentMethodErrorModal')).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('dt_payment_method_error_ok_button'));
        expect(screen.queryByText('PaymentMethodErrorModal')).not.toBeInTheDocument(); // modal should be hidden
    });
});
