import { useState, useEffect } from "react";
import axios from "axios";

export function Pharmacy() {
    const [list, setList] = useState(() => {
        // Tải danh sách sản phẩm từ local storage khi khởi tạo
        const savedList = localStorage.getItem('productList');
        return savedList ? JSON.parse(savedList) : [
            {
                ididproduct: "PROD-0001",
                nameproduc: "Blackmores Omega Double High Strength Fish Oil",
                description: "Thực Phẩm Chức Năng",
                category: "Thuốc",
                price: 15000,
                quantity: 100,
                date: "2022-01-01"
            },
            {
                ididproduct: "PROD-0002",
                nameproduc: "Amoxicillin 500mg",
                description: "Kháng sinh điều trị nhiễm khuẩn",
                category: "Thuốc",
                price: 12000,
                quantity: 150,
                date: "2024-01-05"
            },
            {
                ididproduct: "PROD-0003",
                nameproduc: "Vitamin C 1000mg",
                description: "Giúp tăng cường sức đề kháng",
                category: "Thực phẩm chức năng",
                price: 25000,
                quantity: 80,
                date: "2024-01-10"
            }
        ];
    });

    const [categories, setCategories] = useState([]);
    const [idInput, setIdInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [priceInput, setPriceInput] = useState('');
    const [quantityInput, setQuantityInput] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [indexEdit, setIndexEdit] = useState(-1);

    // Trạng thái tìm kiếm
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await axios.get('/db.json'); 
                setCategories(result.data.categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setMessage("Lỗi khi tải danh sách thể loại.");
            }
        };
        fetchCategories();
    }, []);

    // Hàm lưu danh sách vào local storage
    const saveToLocalStorage = (newList) => {
        localStorage.setItem('productList', JSON.stringify(newList));
    };

    const add = () => {
        if (!idInput || !nameInput || !descriptionInput || !categoryInput || !priceInput || !quantityInput || !dateInput) {
            setMessage("Tất cả các trường đều bắt buộc phải nhập.");
            return;
        }
        if (!/^PROD-\d{4}$/.test(idInput)) {
            setMessage("Mã sản phẩm phải đúng định dạng PROD–XXXX (với X là các số).");
            return;
        }
        if (new Date(dateInput) > new Date()) {
            setMessage("Ngày nhập sản phẩm không được lớn hơn ngày hiện tại.");
            return;
        }
        if (parseInt(quantityInput) <= 0) {
            setMessage("Số lượng sản phẩm phải là số nguyên lớn hơn 0.");
            return;
        }

        let newProduct = {
            ididproduct: idInput,
            nameproduc: nameInput,
            description: descriptionInput,
            category: categoryInput,
            price: parseFloat(priceInput),
            quantity: parseInt(quantityInput),
            date: dateInput
        };

        if (isEdit) {
            edit(newProduct);
        } else {
            const updatedList = [...list, newProduct];
            setList(updatedList);
            saveToLocalStorage(updatedList); 
            setMessage("Thêm sản phẩm thành công!");
        }
    };

    const edit = (updatedProduct) => {
        let newList = [...list];
        newList[indexEdit] = updatedProduct;
        setList(newList);
        saveToLocalStorage(newList); 
        resetInputs();
        setMessage("Cập nhật sản phẩm thành công!");
    };

    const remove = (index) => {
        let isConfirm = window.confirm("Are you sure?");
        if (isConfirm) {
            let newList = list.filter((_, idx) => idx !== index);
            setList(newList);
            saveToLocalStorage(newList); 
            setMessage("Xóa sản phẩm thành công!");
        }
    };

    const showDataEdit = (index) => {
        let oldProduct = list[index];
        setIdInput(oldProduct.ididproduct);
        setNameInput(oldProduct.nameproduc);
        setDescriptionInput(oldProduct.description);
        setCategoryInput(oldProduct.category);
        setPriceInput(oldProduct.price);
        setQuantityInput(oldProduct.quantity);
        setDateInput(oldProduct.date);
        setIsEdit(true);
        setIndexEdit(index);
    };

    const resetInputs = () => {
        setIdInput('');
        setNameInput('');
        setDescriptionInput('');
        setCategoryInput('');
        setPriceInput('');
        setQuantityInput('');
        setDateInput('');
        setIsEdit(false);
        setIndexEdit(-1);
    };
    const filteredList = list.filter(item => {
        const matchesName = item.nameproduc.toLowerCase().includes(searchName.toLowerCase());
        const matchesCategory = searchCategory ? item.category === searchCategory : true;
        return matchesName && matchesCategory;
    });

    return (
        <>
            <h1>Thêm sản phẩm</h1>
            <input type="text" placeholder="Mã Sản Phẩm" value={idInput} onChange={(e) => setIdInput(e.target.value)} />
            <input type="text" placeholder="Tên Sản Phẩm" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
            <input type="text" placeholder="Mô Tả Sản Phẩm" value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} />
            <select value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}>
                <option value="">Chọn Thể Loại</option>
                {categories.map((cat, index) => (
                    <option key={index} value={cat.name}>{cat.name}</option>
                ))}
            </select>
            <input type="number" placeholder="Giá" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} />
            <input type="number" placeholder="Số Lượng" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} />
            <input type="date" placeholder="Ngày Nhập Sản Phẩm" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
            {isEdit ? <button onClick={() => add()}>Sửa</button> : <button onClick={() => add()}>Thêm</button>}
            {message && <p>{message}</p>}

            <h1>Tìm kiếm sản phẩm</h1>
            <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
            />
            <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                <option value="">Tất cả thể loại</option>
                {categories.map((cat, index) => (
                    <option key={index} value={cat.name}>{cat.name}</option>
                ))}
            </select>

            <h1>Danh sách sản phẩm</h1>
            <table border={1}>
                <thead>
                    <tr>
                        <td>#</td>
                        <td>Mã Sản Phẩm</td>
                        <td>Tên Sản Phẩm</td>
                        <td>Mô Tả Sản Phẩm</td>
                        <td>Thể Loại</td>
                        <td>Giá</td>
                        <td>Số Lượng</td>
                        <td>Ngày Nhập Sản Phẩm</td>
                        <th colSpan={2}>Chức năng</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        filteredList.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.ididproduct}</td>
                                <td>{item.nameproduc}</td>
                                <td>{item.description}</td>
                                <td>{item.category}</td>
                                <td>{item.price}</td>
                                <td>{item.quantity}</td>
                                <td>{item.date}</td>
                                <td>
                                    <button onClick={() => showDataEdit(index)}>Sửa</button>
                                </td>
                                <td>
                                    <button onClick={() => remove(index)}>Xóa</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    );
}