import zipfile
import xml.etree.ElementTree as ET

def get_shared_strings(zip_file):
    try:
        with zip_file.open('xl/sharedStrings.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            # The namespace for sharedStrings is usually http://schemas.openxmlformats.org/spreadsheetml/2006/main
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            strings = []
            for t in root.findall('.//ns:t', ns):
                strings.append(t.text or "")
            return strings
    except Exception as e:
        print(f"Error reading shared strings: {e}")
        return []

def get_sheet_cells(zip_file, sheet_path, shared_strings):
    try:
        with zip_file.open(sheet_path) as f:
            tree = ET.parse(f)
            root = tree.getroot()
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            
            rows = {}
            for row in root.findall('.//ns:row', ns):
                row_idx = int(row.attrib.get('r'))
                row_cells = []
                for cell in row.findall('ns:c', ns):
                    r_attr = cell.attrib.get('r', '')
                    t_attr = cell.attrib.get('t', '')
                    val_node = cell.find('ns:v', ns)
                    
                    val = ""
                    if val_node is not None:
                        val = val_node.text or ""
                        if t_attr == 's':
                            idx = int(val)
                            if idx < len(shared_strings):
                                val = shared_strings[idx]
                    
                    row_cells.append((r_attr, val))
                rows[row_idx] = row_cells
            return rows
    except Exception as e:
        print(f"Error reading sheet {sheet_path}: {e}")
        return {}

def main():
    excel_path = 'scratch/formulario033.xlsx'
    with zipfile.ZipFile(excel_path, 'r') as zip_ref:
        shared_strings = get_shared_strings(zip_ref)
        print(f"Read {len(shared_strings)} shared strings.")
        
        # Read sheet 2
        rows = get_sheet_cells(zip_ref, 'xl/worksheets/sheet2.xml', shared_strings)
        print(f"\n--- SHEET 2 DATA (total rows: {len(rows)}) ---")
        for idx in sorted(rows.keys()):
            cells_str = ", ".join([f"{r}: '{v}'" for r, v in rows[idx] if v])
            if cells_str:
                print(f"Row {idx:02d}: {cells_str}")

if __name__ == '__main__':
    main()
