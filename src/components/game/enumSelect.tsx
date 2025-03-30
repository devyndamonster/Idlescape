import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
type EnumType = Record<number, string>;

interface Props<T extends EnumType> {
    enumObject: T;
    value: T[keyof T] & number;
    onChanged: (enumValue: T[keyof T] & number) => void;
    valueName: string;
}


export default function EnumSelect<T extends EnumType>({enumObject, value, onChanged, valueName}: Props<T>) {

    const enumNumberKeys: (T[keyof T] & number)[] = Object.values(enumObject).filter(key => typeof key === "number");

    const enumNumberToStringMapping: Record<T[keyof T] & number, string> = enumNumberKeys.reduce((acc, key) => {
        const enumName = enumObject[key];
        acc[key] = enumName;
        return acc;
    }, {} as Record<T[keyof T] & number, string>);

    const enumStringToNumberMapping: Record<string, T[keyof T] & number> = enumNumberKeys.reduce((acc, key) => {
        const enumName = enumObject[key];
        acc[enumName] = key;
        return acc;
    }, {} as Record<string, T[keyof T] & number>);

    const onSelectedEnumChanged = (value: string) => {
        const enumValue = enumStringToNumberMapping[value];
        onChanged(enumValue);
    }
    
    return (
        <>
            <Label className="text-right">
                {valueName}
            </Label>
            <Select value={enumNumberToStringMapping[value]} onValueChange={onSelectedEnumChanged}>
                <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder={`Select a ${valueName}`} />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(enumStringToNumberMapping).map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    )
}