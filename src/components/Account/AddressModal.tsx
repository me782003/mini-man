'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, LocateFixed } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCountryHelpers } from '@/lib/hooks/useCountries';
import { SHIPPING_COUNTRY_CODE, isEgyptianMobile, isValidPhone, normalizeEgyptianPhone } from '@/lib/countries';
import CountrySelect from '@/components/Country/CountrySelect';
import PhoneInput from '@/components/Country/PhoneInput';
import { useBostaCities, useBostaDistricts } from '@/lib/hooks/useShipping';
import type { Address } from '@/lib/hooks/useProfile';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';

export interface AddressForm {
    first_name: string;
    last_name: string;
    phone: string;
    city: string;
    street_address: string;
    apartment: string;
    country_id: number;
    latitude: number | null;
    longitude: number | null;
    is_default: boolean;
    bosta_city_id: string;
    bosta_city_name: string;
    bosta_district_id: string;
    bosta_district_name: string;
}

export const EMPTY_FORM: AddressForm = {
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    street_address: '',
    apartment: '',
    country_id: 0,
    latitude: null,
    longitude: null,
    is_default: false,
    bosta_city_id: '',
    bosta_city_name: '',
    bosta_district_id: '',
    bosta_district_name: '',
};

export function addressToForm(address: Address): AddressForm {
    return {
        first_name: address.first_name,
        last_name: address.last_name,
        phone: address.phone ?? '',
        city: address.city,
        street_address: address.street_address,
        apartment: address.apartment ?? '',
        country_id: address.country_id,
        latitude: address.latitude ?? null,
        longitude: address.longitude ?? null,
        is_default: address.is_default === 1,
        bosta_city_id: address.bosta_city_id ?? '',
        bosta_city_name: address.bosta_city_name ?? '',
        bosta_district_id: address.bosta_district_id ?? '',
        bosta_district_name: address.bosta_district_name ?? '',
    };
}

// Orders ship automatically only when the address has a Bosta city + district and an Egyptian mobile.
export function isAddressComplete(address: Address): boolean {
    return !!address.bosta_city_id && !!address.bosta_district_id && isEgyptianMobile(address.phone ?? '');
}

type FormErrors = Partial<Record<keyof AddressForm, string>>;

const MAX_NAME_LENGTH = 255;

interface AddressModalProps {
    mode: 'add' | 'edit';
    form: AddressForm;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCountryChange: (id: number) => void;
    onFieldsChange: (patch: Partial<AddressForm>) => void;
    onDefaultToggle: () => void;
    /** Receives the validated form with the phone normalized. */
    onSave: (form: AddressForm) => void;
    onClose: () => void;
    saving: boolean;
    notice?: string;
    error?: string | null;
    /** The user has no addresses yet — this one becomes the default automatically. */
    isFirstAddress?: boolean;
}

export default function AddressModal({
    mode,
    form,
    onChange,
    onCountryChange,
    onFieldsChange,
    onDefaultToggle,
    onSave,
    onClose,
    saving,
    notice,
    error,
    isFirstAddress = false,
}: AddressModalProps) {
    const t = useTranslations('Orders');
    const ta = useTranslations('Account');
    const tc = useTranslations('Common');
    const isAr = useLocale() === 'ar';
    const tCountry = useTranslations('Country');
    const {
        countries,
        isLoading: countriesLoading,
        isError: countriesFailed,
        refetch: refetchCountries,
        getCountryById,
        getDefaultCountry,
    } = useCountryHelpers();
    const { data: cities = [], isLoading: citiesLoading, isError: citiesFailed } = useBostaCities();
    const { data: districts = [], isLoading: districtsLoading, isError: districtsFailed } = useBostaDistricts(form.bosta_city_id || null);
    const [errors, setErrors] = useState<FormErrors>({});
    useLockBodyScroll();
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState(false);
    // Shipping is Egypt-only: preselect it for new addresses.
    const egyptId = getDefaultCountry()?.id;
    useEffect(() => {
        if (!form.country_id && egyptId) onCountryChange(egyptId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [egyptId]);

    if (typeof document === 'undefined') return null;

    // Bosta unreachable → let the customer type the city instead of blocking the save.
    const bostaUnavailable = citiesFailed || (!!form.bosta_city_id && districtsFailed);
    const isLegacyAddress = mode === 'edit' && !form.bosta_district_id && !bostaUnavailable;
    const selectedCountry = getCountryById(form.country_id);
    // Only Egypt can be delivered to, so with an Egypt-only list there's nothing to choose.
    const onlyEgypt = countries.length === 1 && countries[0].code === SHIPPING_COUNTRY_CODE;
    const noCountries = !countriesLoading && !countriesFailed && countries.length === 0;
    // The saved country was deactivated since — ask for an active one.
    const inactiveCountry = !!form.country_id && countries.length > 0 && !selectedCountry;

    const validate = (phone: string): FormErrors => {
        const e: FormErrors = {};
        if (!form.first_name.trim()) e.first_name = t('fieldRequired');
        else if (form.first_name.trim().length > MAX_NAME_LENGTH) e.first_name = ta('nameTooLong');
        if (!form.last_name.trim()) e.last_name = t('fieldRequired');
        else if (form.last_name.trim().length > MAX_NAME_LENGTH) e.last_name = ta('nameTooLong');
        if (!isValidPhone(phone)) e.phone = t('phoneInvalid');
        if (noCountries) e.country_id = tCountry('deliveryUnavailable');
        else if (!selectedCountry) e.country_id = inactiveCountry ? tCountry('chooseActiveCountry') : t('fieldRequired');
        else if (selectedCountry.code !== SHIPPING_COUNTRY_CODE) e.country_id = tCountry('egyptOnly');
        if (form.street_address.trim().length < 6) e.street_address = t('streetTooShort');
        if (bostaUnavailable) {
            if (!form.city.trim()) e.city = t('fieldRequired');
        } else {
            if (!form.bosta_city_id) e.bosta_city_id = t('fieldRequired');
            if (!form.bosta_district_id) e.bosta_district_id = t('fieldRequired');
        }
        return e;
    };

    const handleSave = () => {
        // International numbers are already "+<code><number>"; Egyptian ones become "01…".
        const phone = form.phone.trim().startsWith('+') && !form.phone.trim().startsWith('+20')
            ? form.phone.replace(/[\s-]/g, '')
            : normalizeEgyptianPhone(form.phone);
        const e = validate(phone);
        setErrors(e);
        if (Object.keys(e).length > 0) return;
        onSave({
            ...form,
            phone,
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            street_address: form.street_address.trim(),
            apartment: form.apartment.trim(),
            city: form.city.trim(),
            // A real boolean — the backend treats the string "false" as true. The first address is always default.
            is_default: isFirstAddress ? true : !!form.is_default,
        });
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) { setLocationError(true); return; }
        setLocating(true);
        setLocationError(false);
        navigator.geolocation.getCurrentPosition(
            pos => {
                setLocating(false);
                onFieldsChange({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            },
            () => { setLocating(false); setLocationError(true); },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const fieldError = (key: keyof AddressForm) =>
        errors[key] ? <p className="mt-1 font-beatrice text-[12px] text-red-500">{errors[key]}</p> : null;

    const inputClass = (key: keyof AddressForm) =>
        `w-full border px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none ${errors[key] ? 'border-red-400' : 'border-gray-300'}`;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-[650px] overflow-y-auto bg-white p-5 sm:p-6 md:p-8 lg:p-10">
                <h2 className="mb-6 font-beatrice text-[24px] font-bold text-black sm:mb-7 sm:text-[32px]">
                    {mode === 'add' ? ta('addAddress') : ta('editAddress')}
                </h2>

                {(notice || isLegacyAddress) && (
                    <p className="mb-5 border border-amber-300 bg-amber-50 px-4 py-3 font-beatrice text-[13px] font-medium text-amber-800">
                        {notice ?? ta('selectCityAreaNotice')}
                    </p>
                )}

                {/* First / Last name */}
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <input
                            name="first_name"
                            value={form.first_name}
                            onChange={onChange}
                            placeholder={tc('firstName')}
                            className={inputClass('first_name')}
                        />
                        {fieldError('first_name')}
                    </div>
                    <div>
                        <input
                            name="last_name"
                            value={form.last_name}
                            onChange={onChange}
                            placeholder={tc('lastName')}
                            className={inputClass('last_name')}
                        />
                        {fieldError('last_name')}
                    </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                    <PhoneInput
                        countries={countries}
                        value={form.phone}
                        onChange={phone => onFieldsChange({ phone })}
                        invalid={!!errors.phone}
                    />
                    {fieldError('phone')}
                </div>

                {/* Country — hidden when Egypt is the only option (sent automatically) */}
                {countriesFailed ? (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border border-red-200 bg-red-50 px-4 py-3 font-beatrice text-[13px] text-red-600">
                        <span>{tCountry('loadFailed')}</span>
                        <button type="button" onClick={() => refetchCountries()} className="font-semibold text-black underline underline-offset-2">
                            {tCountry('retry')}
                        </button>
                    </div>
                ) : noCountries ? (
                    <p className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 font-beatrice text-[13px] font-medium text-amber-800">
                        {tCountry('deliveryUnavailable')}
                    </p>
                ) : !onlyEgypt && (
                    <div className="mb-4">
                        <CountrySelect
                            countries={countries}
                            value={selectedCountry ? form.country_id : null}
                            onChange={onCountryChange}
                            isSelectable={c => c.code === SHIPPING_COUNTRY_CODE}
                            disabledHint={tCountry('egyptOnly')}
                            invalid={!!errors.country_id}
                        />
                        {fieldError('country_id')}
                        {!errors.country_id && inactiveCountry && (
                            <p className="mt-1 font-beatrice text-[12px] text-amber-700">{tCountry('chooseActiveCountry')}</p>
                        )}
                    </div>
                )}

                {/* Governorate / District (Bosta) — free-text city if Bosta is unreachable */}
                {bostaUnavailable ? (
                    <div className="mb-4">
                        <input
                            name="city"
                            value={form.city}
                            onChange={onChange}
                            placeholder={t('governorate')}
                            className={inputClass('city')}
                        />
                        {fieldError('city')}
                        <p className="mt-1 font-beatrice text-[12px] text-gray-500">{ta('cityListUnavailable')}</p>
                    </div>
                ) : (
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <SearchableSelect
                            options={cities.map(c => ({ id: c.id, name: c.name, nameAr: c.name_ar }))}
                            value={form.bosta_city_id}
                            isAr={isAr}
                            placeholder={citiesLoading ? t('loading') : t('selectGovernorate')}
                            ariaLabel={t('governorate')}
                            searchPlaceholder={t('search')}
                            noResults={t('noResults')}
                            invalid={!!errors.bosta_city_id}
                            onChange={opt => {
                                if (opt.id === form.bosta_city_id) return;
                                // English names always — Bosta matches on them.
                                onFieldsChange({
                                    bosta_city_id: opt.id,
                                    bosta_city_name: opt.name,
                                    city: opt.name,
                                    bosta_district_id: '',
                                    bosta_district_name: '',
                                });
                            }}
                        />
                        {fieldError('bosta_city_id')}
                    </div>
                    <div>
                        <SearchableSelect
                            options={districts.map(d => ({ id: d.id, name: d.name, nameAr: d.name_ar }))}
                            value={form.bosta_district_id}
                            isAr={isAr}
                            disabled={!form.bosta_city_id}
                            placeholder={
                                !form.bosta_city_id
                                    ? t('selectGovernorateFirst')
                                    : districtsLoading ? t('loading') : t('selectDistrict')
                            }
                            ariaLabel={t('district')}
                            searchPlaceholder={t('search')}
                            noResults={t('noResults')}
                            invalid={!!errors.bosta_district_id}
                            onChange={opt => onFieldsChange({ bosta_district_id: opt.id, bosta_district_name: opt.name })}
                        />
                        {fieldError('bosta_district_id')}
                    </div>
                </div>
                )}

                {/* Street */}
                <div className="mb-4">
                    <input
                        name="street_address"
                        value={form.street_address}
                        onChange={onChange}
                        placeholder={ta('streetPlaceholder')}
                        className={inputClass('street_address')}
                    />
                    {fieldError('street_address')}
                </div>

                {/* Apartment */}
                <input
                    name="apartment"
                    value={form.apartment}
                    onChange={onChange}
                    placeholder={ta('apartmentOptional')}
                    className="mb-4 w-full border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                />

                {/* Optional location */}
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={useMyLocation}
                        disabled={locating}
                        className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 font-beatrice text-[13px] font-medium text-black transition-colors hover:border-black disabled:opacity-50"
                    >
                        <LocateFixed size={15} />
                        {locating ? tc('loading') : ta('useMyLocation')}
                    </button>
                    {form.latitude != null && form.longitude != null && !locating && (
                        <span className="font-beatrice text-[12px] font-medium text-green-700">✓ {ta('locationAdded')}</span>
                    )}
                    {locationError && (
                        <span className="font-beatrice text-[12px] text-red-500">{ta('locationFailed')}</span>
                    )}
                </div>

                {/* Default checkbox — the first address is always the default */}
                {!isFirstAddress && (
                <label className="mb-7 flex cursor-pointer items-start gap-3 sm:items-center">
                    <button
                        type="button"
                        onClick={onDefaultToggle}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${form.is_default ? 'border-black bg-black' : 'border-gray-400 bg-white'
                            }`}
                    >
                        {form.is_default && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path
                                    d="M1 4L3.5 6.5L9 1"
                                    stroke="white"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </button>
                    <span className="font-beatrice text-[14px] font-semibold text-black">
                        {ta('setDefaultShipping')}
                    </span>
                </label>
                )}

                {error && (
                    <p className="mb-4 font-beatrice text-[13px] text-red-500">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 sm:gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex flex-1 items-center justify-between bg-black px-5 py-4 font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 sm:px-7 sm:text-[16px]"
                    >
                        <span>{saving ? tc('saving') : ta('saveChanges')}</span>
                        <svg width="28" height="11" viewBox="0 0 37 14" fill="none" className="rtl:rotate-180">
                            <path
                                d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="border border-gray-300 px-3 py-4 font-beatrice text-[15px] font-semibold text-black transition-colors hover:bg-gray-50 sm:px-10 sm:text-[16px] md:px-6"
                    >
                        {tc('back')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Bosta's Arabic names use informal spellings ("الاسكندريه"), so fold
// alef / taa marbuta / yaa variants and Arabic-Indic digits before matching.
function normalizeSearch(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[ً-ْ]/g, '')
        .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660));
}

interface SelectOption {
    id: string;
    name: string;
    nameAr: string;
}

interface SearchableSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (option: SelectOption) => void;
    isAr: boolean;
    placeholder: string;
    ariaLabel: string;
    searchPlaceholder: string;
    noResults: string;
    disabled?: boolean;
    invalid?: boolean;
}

function SearchableSelect({
    options, value, onChange, isAr, placeholder, ariaLabel, searchPlaceholder, noResults, disabled, invalid,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const label = (o: SelectOption) => (isAr ? o.nameAr || o.name : o.name);
    const selected = options.find(o => o.id === value);
    // Match either language so customers can type Arabic or English in any locale.
    const query = normalizeSearch(search);
    const filtered = query
        ? options.filter(o => normalizeSearch(o.name).includes(query) || normalizeSearch(o.nameAr).includes(query))
        : options;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                aria-label={ariaLabel}
                onClick={() => { setOpen(v => !v); setSearch(''); }}
                className={`flex w-full items-center justify-between gap-2 border px-4 py-3 text-start font-beatrice text-[14px] transition-colors ${open ? 'border-black' : invalid ? 'border-red-400' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed bg-gray-50 opacity-70' : 'bg-white hover:border-gray-400'}`}
            >
                <span className={`truncate ${selected ? 'text-black' : 'text-gray-400'}`}>
                    {selected ? label(selected) : placeholder}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 border border-t-0 border-gray-300 bg-white shadow-lg">
                    <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
                        <Search size={14} className="shrink-0 text-gray-400" />
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full font-beatrice text-[13px] text-black placeholder:text-gray-400 outline-none"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 font-beatrice text-[13px] text-gray-400">{noResults}</li>
                        ) : (
                            filtered.map(o => (
                                <li key={o.id}>
                                    <button
                                        type="button"
                                        onClick={() => { onChange(o); setOpen(false); setSearch(''); }}
                                        className="flex w-full items-center justify-between px-4 py-2.5 text-start font-beatrice text-[14px] text-black transition-colors hover:bg-gray-50"
                                    >
                                        <span>{label(o)}</span>
                                        {o.id === value && <Check size={14} className="shrink-0 text-black" />}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
