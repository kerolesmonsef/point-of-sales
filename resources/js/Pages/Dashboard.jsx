import Card from '@/Components/Dashboard/Card';
import Table from '@/Components/Dashboard/Table';
import Widget from '@/Components/Dashboard/Widget';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { IconBox, IconCategory, IconMoneybag, IconUsers } from '@tabler/icons-react';
export default function Dashboard() {



    return (
        <>
            <Head title='Dashboard' />
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                <Widget
                    title={__('Categories')}
                    subtitle={__('Total Categories')}
                    color={'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}
                    icon={<IconCategory size={'20'} strokeWidth={'1.5'} />}
                    total={20}
                />
                <Widget
                    title={__('Products')}
                    subtitle={__('Total Products')}
                    color={'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}
                    icon={<IconBox size={'20'} strokeWidth={'1.5'} />}
                    total={30}
                />
                <Widget
                    title={__('Transactions')}
                    subtitle={__('Total Transactions')}
                    color={'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}
                    icon={<IconMoneybag size={'20'} strokeWidth={'1.5'} />}
                    total={45}
                />
                <Widget
                    title={__('Users')}
                    subtitle={__('Total Users')}
                    color={'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}
                    icon={<IconUsers size={'20'} strokeWidth={'1.5'} />}
                    total={2}
                />
            </div>
        </>
    );
}

Dashboard.layout = page => <DashboardLayout children={page} />
