import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';

export interface Option {
    id: string | number;
    name: string;
    [key: string]: any;
}

interface SearchableSelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
}

export default function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    className = '',
    required = false,
    disabled = false,
    id,
}: SearchableSelectProps) {
    const [query, setQuery] = useState('');

    const selectedOption = options.find((option) => option.id.toString() === value?.toString()) || null;

    const filteredOptions =
        query === ''
            ? options
            : options.filter((option) => {
                return option.name.toLowerCase().includes(query.toLowerCase());
            });

    return (
        <div className={`relative ${className}`}>
            <Combobox value={selectedOption} onChange={(option: Option | null) => {
                if (option) {
                    onChange(option.id);
                }
            }} disabled={disabled}>
                <div className="relative w-full">
                    <Combobox.Input
                        id={id}
                        className={`input-dark w-full text-sm sm:text-base pr-10 truncate cursor-text ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        displayValue={(option: Option) => option?.name || ''}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={placeholder}
                        required={required && !value}
                        autoComplete="off"
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path
                                d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Combobox.Button>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-gray-800 text-sm sm:text-base shadow-lg ring-1 ring-white/10 focus:outline-none">
                        {filteredOptions.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
                                Nothing found.
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <Combobox.Option
                                    key={option.id}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-200'
                                        }`
                                    }
                                    value={option}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal'
                                                    }`}
                                            >
                                                {option.name}
                                            </span>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-indigo-400' : 'text-indigo-500'
                                                        }`}
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </Combobox>
        </div>
    );
}
