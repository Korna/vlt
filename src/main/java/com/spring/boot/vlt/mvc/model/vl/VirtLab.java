package com.spring.boot.vlt.mvc.model.vl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;

public class VirtLab {
    @Autowired
    private Environment env;

    @NotNull
    @Size(min = 1, message = "Введите название ВЛ")
    private String name;
    private String dirName;
    static String propertyFileName = "lab.desc";

    public VirtLab() {
        name = "";
        dirName = "";
    }

    public VirtLab(String name, String dirName) {
        this.name = name;
        this.dirName = dirName;
    }

    public VirtLab(File file) {
        readFile(file);
        dirName = file.getParentFile().getName();

    }

    public String getDirName() {
        return dirName;
    }

    public void setDirName(String dirName) {
        this.dirName = dirName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    private void readFile(File desc) {
        try {
            BufferedReader in = new BufferedReader(new FileReader(desc.getAbsoluteFile()));
            try {
                String s;
                while ((s = in.readLine()) != null) {
                    if (s.matches("name=(.*)")) {
                        name = s.substring(5);
                    } else if (s.matches("dirName=(.*)")) {
                        dirName = s.substring(8);
                    }
                }
            } finally {
                in.close();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String toString() {
        return "#Virtual Lab settings\n" +
                new SimpleDateFormat("dd.MM.yyyy hh:mm").format(new Date()) + "\n" +
                "name=" + name + "\n" +

                "dirName=" + dirName;
    }


    public boolean save(String path) {
        File desc = new File(path + File.separator + dirName, propertyFileName);
        try {
            desc.createNewFile();
            PrintWriter out = new PrintWriter(desc.getAbsoluteFile());
            try {
                out.print(toString());
            } finally {
                out.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

}
