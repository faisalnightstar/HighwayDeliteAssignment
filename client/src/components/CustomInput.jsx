const CustomInput = ({
    id,
    label,
    className = "",
    type = "text",
    icon: Icon,
    register,
    error,
    ...rest
}) => {
    return (
        <div className="relative mb-4 mt-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon
                    className={`text-gray-400 ${error ? "text-red-500" : "peer-focus:text-btn-bg-color"
                        }`}
                />
            </div>
            <input
                id={id}
                autoComplete="on"
                type={type}
                className={`
            block
            w-full
            pl-10 pr-4 py-2 mt-8
            text-base
         ${className}
         
            text-gray-900
            rounded-lg
            border
            appearance-none
            focus:outline-none
            focus:ring-0
            peer
            ${error
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                    }
          `}
                placeholder=" "
                {...register}
                {...rest}
            />

            <label
                htmlFor={id}
                className={`
            absolute
            text-base
            origin-[0]
            left-3
            scale-75
            -top-3
            z-10
            bg-white
            px-1
           
            ${error
                        ? "text-red-500 peer-focus:text-red-500"
                        : "text-gray-500 peer-focus:text-blue-600"
                    }
          `}
            >
                {label}
            </label>
            {error && (
                <p className="absolute mt-0.5 left-3 text-sm text-red-600">{error.message}</p>
            )}
        </div>
    );
};

export default CustomInput;
