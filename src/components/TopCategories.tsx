import { Link } from '../i18n/navigation';

const categories = [
    { label: 'Men', href: '/men' },
    { label: 'Women', href: '/women' },
    { label: 'Kids', href: '/kids' },
    { label: 'Accessories', href: '/accessories' },
];

export default function TopCategories() {
    return (
        <div className="w-full  py-2.5 md:hidden ">
            <div className="mx-auto flex  items-center justify-center gap-8 px-4 sm:gap-12 md:gap-16">
                {categories.map((category) => (
                    <Link
                        key={category.label}
                        href={category.href}
                        className="text-[12px] font-beatrice font-medium leading-none text-black transition-opacity hover:opacity-70"
                    >
                        {category.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}