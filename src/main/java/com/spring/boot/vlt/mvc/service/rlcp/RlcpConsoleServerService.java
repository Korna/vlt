package com.spring.boot.vlt.mvc.service.rlcp;

import com.spring.boot.vlt.config.property.VltSettings;
import com.spring.boot.vlt.mvc.model.Trial;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rlcp.RlcpRequestBody;
import rlcp.calculate.CalculatingResult;
import rlcp.calculate.RlcpCalculateRequestBody;
import rlcp.calculate.RlcpCalculateResponseBody;
import rlcp.check.CheckingResult;
import rlcp.check.RlcpCheckRequestBody;
import rlcp.check.RlcpCheckResponseBody;
import rlcp.generate.GeneratingResult;
import rlcp.generate.RlcpGenerateRequestBody;
import rlcp.generate.RlcpGenerateResponseBody;
import rlcp.method.RlcpMethod;
import rlcp.server.ServerMethod;
import rlcp.server.flow.RlcpRequestFlow;
import rlcp.server.processor.factory.DefaultConstructorProcessorFactory;
import rlcp.server.processor.factory.ProcessorFactoryContainer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;

@Service
public class RlcpConsoleServerService {

    private final Logger LOGGER = LoggerFactory.getLogger(this.getClass());
    @Autowired
    private Trial trial;
    @Autowired
    private VltSettings vltSettings;

    public GeneratingResult getGenerateForConsole(String algorithm) throws Exception {
        RlcpGenerateRequestBody requestBody = new RlcpGenerateRequestBody(algorithm);

        URI jarURI = getJarURI();
        if (jarURI == null) {
            throw new NullPointerException("jar file for " + trial.getVl().getDirName() + " not found");
        }
        URLClassLoader child = new URLClassLoader(new URL[]{jarURI.toURL()}, this.getClass().getClassLoader());
        String className = getClassNameForRlcpMethod(jarURI, RlcpMethod.Generate);
        if (className == null) {
            throw new NullPointerException("not found Generate class in jar");
        }
        Class classToLoad = Class.forName(className, true, child);

        ProcessorFactoryContainer container = new ProcessorFactoryContainer();
        container.setGenerateProcessorFactory(new DefaultConstructorProcessorFactory(classToLoad));

        RlcpRequestFlow flow = ServerMethod.GENERATE.getFlow();
        RlcpGenerateResponseBody responseBody = (RlcpGenerateResponseBody) flow.processBody(container, requestBody);

        return responseBody.getGeneratingResult();
    }

    public List<CheckingResult> getCheckForConsole(String instructions) throws Exception {
        RlcpCheckRequestBody requestBody = new RlcpCheckRequestBody(trial.getConditionsList(), instructions, trial.getGeneratingResult());

        URI jarURI = getJarURI();
        if (jarURI == null) {
            throw new NullPointerException("jar file for " + trial.getVl().getDirName() + " not found");
        }
        URLClassLoader child = new URLClassLoader(new URL[]{jarURI.toURL()}, this.getClass().getClassLoader());
        String className = getClassNameForRlcpMethod(jarURI, RlcpMethod.Check);
        if (className == null) {
            throw new NullPointerException("not found Check class in jar");
        }
        Class classToLoad = Class.forName(className, true, child);

        ProcessorFactoryContainer container = new ProcessorFactoryContainer();
        container.setCheckProcessorFactory(new DefaultConstructorProcessorFactory(classToLoad));

        RlcpRequestFlow flow = ServerMethod.CHECK.getFlow();
        RlcpCheckResponseBody responseBody = (RlcpCheckResponseBody) flow.processBody(container, requestBody);

        return responseBody.getResults();
    }


    public CalculatingResult getCalculateForConsole(String instructions, String condition) throws Exception {
        RlcpCalculateRequestBody requestBody = new RlcpCalculateRequestBody(condition, instructions, trial.getGeneratingResult());


        URI jarURI = getJarURI();
        if (jarURI == null) {
            throw new NullPointerException("jar file for " + trial.getVl().getDirName() + " not found");
        }
        URLClassLoader child = new URLClassLoader(new URL[]{jarURI.toURL()}, this.getClass().getClassLoader());
        String className = getClassNameForRlcpMethod(jarURI, RlcpMethod.Calculate);
        if (className == null) {
            throw new NullPointerException("not found Calculate class in jar");
        }
        Class classToLoad = Class.forName(className, true, child);

        ProcessorFactoryContainer container = new ProcessorFactoryContainer();
        container.setCalculateProcessorFactory(new DefaultConstructorProcessorFactory(classToLoad));

        RlcpRequestFlow flow = ServerMethod.CHECK.getFlow();
        RlcpCalculateResponseBody responseBody = (RlcpCalculateResponseBody) flow.processBody(container, requestBody);

        return responseBody.getCalculatingResult();
    }

    private URI getJarURI() {
        File jarFile = new File(
                System.getProperty("user.dir") + File.separator +
                        vltSettings.getPathsUploadedFiles() +
                        File.separator + trial.getVl().getDirName() + File.separator + "server" + File.separator + "server.jar");
        if (jarFile.exists()) {
            return jarFile.toURI();
        }
        LOGGER.error("jar file: " + jarFile.getAbsolutePath() + " not found");
        return null;
    }

    private String getClassNameForRlcpMethod(URI jarURI, RlcpMethod method) throws IOException {
        String maskClass = "";
        switch (method.getName().toLowerCase()) {
            case "generate":
                maskClass = "GenerateProcessorImpl";
                break;
            case "check":
                maskClass = "CheckProcessorImpl";
                break;
            case "calculate":
                maskClass = "CalculateProcessorImpl";
                break;
        }

        JarInputStream crunchifyJarFile = new JarInputStream(new FileInputStream(jarURI.getPath()));
        JarEntry crunchifyJar;
        while (true) {
            crunchifyJar = crunchifyJarFile.getNextJarEntry();
            if (crunchifyJar == null) {
                break;
            }
            if ((crunchifyJar.getName().endsWith(".class")) && crunchifyJar.getName().contains(maskClass)) {
                String className = crunchifyJar.getName().replaceAll("/", "\\.");
                String myClass = className.substring(0, className.lastIndexOf('.'));
                return myClass;
            } else {
                continue;
            }
        }
        LOGGER.error("not found class " + maskClass + " in jar " + jarURI.getPath());
        return "";
    }

    private RlcpRequestFlow getFlow(RlcpRequestBody rlcpRequestBody){
        switch (rlcpRequestBody.getMethod().getName().toLowerCase()) {
            case "generate":
                return ServerMethod.GENERATE.getFlow();
            case "check":
                return ServerMethod.CALCULATE.getFlow();
            case "calculate":
                return ServerMethod.CHECK.getFlow();
        }
        LOGGER.error("flow not found for method: " + rlcpRequestBody.getMethod().getName());
        return null;
    }
}
